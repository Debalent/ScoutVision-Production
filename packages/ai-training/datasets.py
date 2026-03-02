"""
═══════════════════════════════════════════════════════════════════════════
ScoutVision AI Training — Dataset Loaders
Sport-video datasets for detection, pose, and classification training.
═══════════════════════════════════════════════════════════════════════════
"""

import os
import json
import random
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
import albumentations as A
from albumentations.pytorch import ToTensorV2


# ═══════════════════════════════════════════════════════════════════════════
# 1. Detection Dataset (COCO-format)
# ═══════════════════════════════════════════════════════════════════════════

class DetectionDataset(Dataset):
    """
    Loads images and bounding-box annotations in COCO format.
    Used for training YOLOv8 player/ball detection.
    """

    CLASS_MAP = {"player": 0, "referee": 1, "ball": 2, "goalkeeper": 3}

    def __init__(
        self,
        images_dir: str,
        annotations_file: str,
        input_size: int = 1280,
        augment: bool = True,
        mosaic_prob: float = 0.5,
    ):
        self.images_dir = Path(images_dir)
        self.input_size = input_size
        self.augment = augment
        self.mosaic_prob = mosaic_prob

        with open(annotations_file, "r") as f:
            coco = json.load(f)

        # Build image index
        self.images: List[Dict] = coco["images"]
        self.image_id_map = {img["id"]: img for img in self.images}

        # Group annotations by image
        self.annotations: Dict[int, List[Dict]] = {}
        for ann in coco["annotations"]:
            img_id = ann["image_id"]
            if img_id not in self.annotations:
                self.annotations[img_id] = []
            self.annotations[img_id].append(ann)

        # Category mapping
        self.cat_map = {cat["id"]: cat["name"] for cat in coco["categories"]}

        # Augmentation pipeline
        self.transform = self._build_augmentation() if augment else self._build_val_transform()

    def _build_augmentation(self) -> A.Compose:
        return A.Compose([
            A.LongestMaxSize(max_size=self.input_size),
            A.PadIfNeeded(
                min_height=self.input_size,
                min_width=self.input_size,
                border_mode=cv2.BORDER_CONSTANT,
                value=(114, 114, 114),
            ),
            A.HueSaturationValue(hue_shift_limit=10, sat_shift_limit=40, val_shift_limit=30, p=0.5),
            A.HorizontalFlip(p=0.5),
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.3),
            A.GaussNoise(var_limit=(10, 50), p=0.2),
            A.MotionBlur(blur_limit=7, p=0.1),
            A.Normalize(mean=[0, 0, 0], std=[1, 1, 1]),
            ToTensorV2(),
        ], bbox_params=A.BboxParams(
            format="coco",
            label_fields=["class_labels"],
            min_visibility=0.3,
        ))

    def _build_val_transform(self) -> A.Compose:
        return A.Compose([
            A.LongestMaxSize(max_size=self.input_size),
            A.PadIfNeeded(
                min_height=self.input_size,
                min_width=self.input_size,
                border_mode=cv2.BORDER_CONSTANT,
                value=(114, 114, 114),
            ),
            A.Normalize(mean=[0, 0, 0], std=[1, 1, 1]),
            ToTensorV2(),
        ], bbox_params=A.BboxParams(
            format="coco",
            label_fields=["class_labels"],
            min_visibility=0.3,
        ))

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        img_info = self.images[idx]
        img_path = self.images_dir / img_info["file_name"]

        # Load image
        img = cv2.imread(str(img_path))
        if img is None:
            raise FileNotFoundError(f"Image not found: {img_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Load annotations
        anns = self.annotations.get(img_info["id"], [])
        bboxes = [ann["bbox"] for ann in anns]  # [x, y, w, h]
        class_labels = [
            self.CLASS_MAP.get(self.cat_map.get(ann["category_id"], ""), 0)
            for ann in anns
        ]

        # Apply transforms
        transformed = self.transform(
            image=img,
            bboxes=bboxes,
            class_labels=class_labels,
        )

        return {
            "image": transformed["image"],
            "bboxes": torch.tensor(transformed["bboxes"], dtype=torch.float32),
            "labels": torch.tensor(transformed["class_labels"], dtype=torch.long),
            "image_id": img_info["id"],
        }


# ═══════════════════════════════════════════════════════════════════════════
# 2. Pose Dataset (COCO Keypoints format)
# ═══════════════════════════════════════════════════════════════════════════

class PoseDataset(Dataset):
    """
    Top-down pose estimation dataset.
    Loads person crops with 17 COCO keypoints.
    """

    NUM_KEYPOINTS = 17

    def __init__(
        self,
        images_dir: str,
        annotations_file: str,
        input_size: Tuple[int, int] = (256, 192),
        heatmap_size: Tuple[int, int] = (64, 48),
        augment: bool = True,
    ):
        self.images_dir = Path(images_dir)
        self.input_h, self.input_w = input_size
        self.hm_h, self.hm_w = heatmap_size
        self.augment = augment
        self.sigma = 2.0

        with open(annotations_file, "r") as f:
            coco = json.load(f)

        # Filter annotations with keypoints
        self.samples = []
        self.image_id_map = {img["id"]: img for img in coco["images"]}

        for ann in coco["annotations"]:
            if ann.get("num_keypoints", 0) > 0 and ann.get("iscrowd", 0) == 0:
                self.samples.append(ann)

        self.transform = self._build_transform()

    def _build_transform(self) -> A.Compose:
        transforms = [
            A.Resize(self.input_h, self.input_w),
        ]
        if self.augment:
            transforms.extend([
                A.HorizontalFlip(p=0.5),
                A.Rotate(limit=40, border_mode=cv2.BORDER_CONSTANT, p=0.6),
                A.RandomBrightnessContrast(p=0.3),
                A.ColorJitter(p=0.2),
            ])
        transforms.extend([
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ])
        return A.Compose(transforms, keypoint_params=A.KeypointParams(
            format="xy", remove_invisible=False
        ))

    def _generate_heatmaps(self, keypoints: np.ndarray) -> np.ndarray:
        """Generate Gaussian heatmaps for each keypoint."""
        heatmaps = np.zeros((self.NUM_KEYPOINTS, self.hm_h, self.hm_w), dtype=np.float32)

        for k in range(self.NUM_KEYPOINTS):
            x, y, v = keypoints[k]
            if v < 1:  # invisible
                continue

            # Scale to heatmap coordinates
            mu_x = x * self.hm_w / self.input_w
            mu_y = y * self.hm_h / self.input_h

            # Generate Gaussian
            x_range = np.arange(self.hm_w)
            y_range = np.arange(self.hm_h)
            xx, yy = np.meshgrid(x_range, y_range)
            heatmaps[k] = np.exp(-((xx - mu_x) ** 2 + (yy - mu_y) ** 2) / (2 * self.sigma ** 2))

        return heatmaps

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        ann = self.samples[idx]
        img_info = self.image_id_map[ann["image_id"]]
        img_path = self.images_dir / img_info["file_name"]

        img = cv2.imread(str(img_path))
        if img is None:
            raise FileNotFoundError(f"Image not found: {img_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Crop person bounding box with padding
        bbox = ann["bbox"]  # [x, y, w, h]
        x, y, w, h = [int(v) for v in bbox]
        pad = int(max(w, h) * 0.15)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img.shape[1], x + w + pad)
        y2 = min(img.shape[0], y + h + pad)
        crop = img[y1:y2, x1:x2]

        # Adjust keypoints to crop coordinates
        kps_raw = np.array(ann["keypoints"]).reshape(-1, 3).astype(np.float32)
        kps_raw[:, 0] -= x1
        kps_raw[:, 1] -= y1

        # Scale keypoints to input size
        scale_x = self.input_w / crop.shape[1]
        scale_y = self.input_h / crop.shape[0]

        kps_for_aug = [(float(kps_raw[k, 0]), float(kps_raw[k, 1])) for k in range(self.NUM_KEYPOINTS)]

        transformed = self.transform(image=crop, keypoints=kps_for_aug)
        img_tensor = transformed["image"]

        # Rebuild keypoints with visibility
        kps_transformed = np.zeros((self.NUM_KEYPOINTS, 3), dtype=np.float32)
        for k, (tx, ty) in enumerate(transformed["keypoints"]):
            kps_transformed[k] = [tx, ty, kps_raw[k, 2]]

        heatmaps = self._generate_heatmaps(kps_transformed)

        return {
            "image": img_tensor,
            "heatmaps": torch.tensor(heatmaps, dtype=torch.float32),
            "keypoints": torch.tensor(kps_transformed, dtype=torch.float32),
            "visibility": torch.tensor(kps_raw[:, 2], dtype=torch.float32),
        }


# ═══════════════════════════════════════════════════════════════════════════
# 3. Play Classification Dataset (video clips)
# ═══════════════════════════════════════════════════════════════════════════

class PlayClassificationDataset(Dataset):
    """
    Temporal sequence dataset for play classification.
    Each sample is a sequence of pose/tracking features over N frames.
    """

    def __init__(
        self,
        features_dir: str,
        labels_file: str,
        sequence_length: int = 64,
        augment: bool = True,
    ):
        self.features_dir = Path(features_dir)
        self.sequence_length = sequence_length
        self.augment = augment

        with open(labels_file, "r") as f:
            self.labels_data = json.load(f)

        self.samples = list(self.labels_data.keys())
        self.class_to_idx = self._build_class_map()

    def _build_class_map(self) -> Dict[str, int]:
        classes = sorted(set(v["play_type"] for v in self.labels_data.values()))
        return {cls: idx for idx, cls in enumerate(classes)}

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        sample_id = self.samples[idx]
        label_info = self.labels_data[sample_id]

        # Load pre-extracted features (pose + tracking per frame)
        features_path = self.features_dir / f"{sample_id}.npy"
        features = np.load(str(features_path))  # shape: [T, D]

        # Pad or truncate to sequence_length
        T, D = features.shape
        if T < self.sequence_length:
            pad = np.zeros((self.sequence_length - T, D), dtype=np.float32)
            features = np.concatenate([features, pad], axis=0)
            mask = np.concatenate([np.ones(T), np.zeros(self.sequence_length - T)])
        elif T > self.sequence_length:
            # Random crop for augmentation, center crop for eval
            if self.augment:
                start = random.randint(0, T - self.sequence_length)
            else:
                start = (T - self.sequence_length) // 2
            features = features[start:start + self.sequence_length]
            mask = np.ones(self.sequence_length)
        else:
            mask = np.ones(self.sequence_length)

        # Augmentation: add Gaussian noise
        if self.augment:
            features = features + np.random.normal(0, 0.01, features.shape).astype(np.float32)

        label = self.class_to_idx[label_info["play_type"]]

        return {
            "features": torch.tensor(features, dtype=torch.float32),
            "mask": torch.tensor(mask, dtype=torch.float32),
            "label": torch.tensor(label, dtype=torch.long),
            "sample_id": sample_id,
        }


# ═══════════════════════════════════════════════════════════════════════════
# 4. Data Loader Factories
# ═══════════════════════════════════════════════════════════════════════════

def create_detection_loaders(
    images_dir: str,
    train_annotations: str,
    val_annotations: str,
    batch_size: int = 16,
    num_workers: int = 8,
    input_size: int = 1280,
) -> Tuple[DataLoader, DataLoader]:
    """Create train and val data loaders for detection."""
    train_ds = DetectionDataset(images_dir, train_annotations, input_size, augment=True)
    val_ds = DetectionDataset(images_dir, val_annotations, input_size, augment=False)

    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, pin_memory=True,
        collate_fn=_detection_collate,
    )
    val_loader = DataLoader(
        val_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=True,
        collate_fn=_detection_collate,
    )
    return train_loader, val_loader


def create_pose_loaders(
    images_dir: str,
    train_annotations: str,
    val_annotations: str,
    batch_size: int = 32,
    num_workers: int = 8,
    input_size: Tuple[int, int] = (256, 192),
) -> Tuple[DataLoader, DataLoader]:
    """Create train and val data loaders for pose estimation."""
    train_ds = PoseDataset(images_dir, train_annotations, input_size, augment=True)
    val_ds = PoseDataset(images_dir, val_annotations, input_size, augment=False)

    return (
        DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True),
        DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True),
    )


def _detection_collate(batch: List[Dict]) -> Dict[str, Any]:
    """Custom collate for variable-length bbox lists."""
    images = torch.stack([item["image"] for item in batch])
    return {
        "images": images,
        "targets": [
            {"bboxes": item["bboxes"], "labels": item["labels"]}
            for item in batch
        ],
    }
