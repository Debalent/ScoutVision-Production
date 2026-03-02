"""
═══════════════════════════════════════════════════════════════════════════
ScoutVision AI Training — Evaluation & Metrics
Detection mAP, pose OKS/PCK, classification accuracy, and full
pipeline end-to-end evaluation.
═══════════════════════════════════════════════════════════════════════════
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger("scoutvision.eval")


# ═══════════════════════════════════════════════════════════════════════════
# 1. Detection Evaluation (COCO-style mAP)
# ═══════════════════════════════════════════════════════════════════════════

def compute_iou(box1: np.ndarray, box2: np.ndarray) -> float:
    """Compute IoU between two boxes [x, y, w, h]."""
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2

    xi1 = max(x1, x2)
    yi1 = max(y1, y2)
    xi2 = min(x1 + w1, x2 + w2)
    yi2 = min(y1 + h1, y2 + h2)

    inter = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    union = w1 * h1 + w2 * h2 - inter

    return inter / max(union, 1e-6)


def compute_ap(precisions: np.ndarray, recalls: np.ndarray) -> float:
    """Compute Average Precision using 101-point interpolation (COCO style)."""
    recall_thresholds = np.linspace(0, 1, 101)
    interpolated = np.zeros_like(recall_thresholds)

    for i, t in enumerate(recall_thresholds):
        mask = recalls >= t
        if mask.any():
            interpolated[i] = precisions[mask].max()

    return interpolated.mean()


def evaluate_detection(
    predictions: List[Dict],
    ground_truth: List[Dict],
    iou_thresholds: List[float] = None,
    classes: List[str] = None,
) -> Dict[str, float]:
    """
    Compute COCO-style detection mAP.

    predictions: list of {image_id, category_id, bbox: [x,y,w,h], score}
    ground_truth: list of {image_id, category_id, bbox: [x,y,w,h]}
    """
    if iou_thresholds is None:
        iou_thresholds = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]

    # Group by category
    categories = set()
    for gt in ground_truth:
        categories.add(gt["category_id"])
    for pred in predictions:
        categories.add(pred["category_id"])

    all_aps = {t: [] for t in iou_thresholds}

    for cat_id in categories:
        cat_preds = sorted(
            [p for p in predictions if p["category_id"] == cat_id],
            key=lambda x: -x["score"]
        )
        cat_gts = [g for g in ground_truth if g["category_id"] == cat_id]

        if len(cat_gts) == 0:
            continue

        # Group GT by image
        gt_by_image: Dict[int, List[Dict]] = {}
        for gt in cat_gts:
            img_id = gt["image_id"]
            if img_id not in gt_by_image:
                gt_by_image[img_id] = []
            gt_by_image[img_id].append(gt)

        for iou_thresh in iou_thresholds:
            tp = np.zeros(len(cat_preds))
            fp = np.zeros(len(cat_preds))
            matched = set()

            for pred_idx, pred in enumerate(cat_preds):
                img_id = pred["image_id"]
                img_gts = gt_by_image.get(img_id, [])

                best_iou = 0
                best_gt_idx = -1
                for gt_idx, gt in enumerate(img_gts):
                    iou = compute_iou(
                        np.array(pred["bbox"]),
                        np.array(gt["bbox"])
                    )
                    if iou > best_iou:
                        best_iou = iou
                        best_gt_idx = gt_idx

                if best_iou >= iou_thresh and (img_id, best_gt_idx) not in matched:
                    tp[pred_idx] = 1
                    matched.add((img_id, best_gt_idx))
                else:
                    fp[pred_idx] = 1

            # Compute precision-recall curve
            tp_cum = np.cumsum(tp)
            fp_cum = np.cumsum(fp)
            recalls = tp_cum / len(cat_gts)
            precisions = tp_cum / (tp_cum + fp_cum + 1e-6)

            ap = compute_ap(precisions, recalls)
            all_aps[iou_thresh].append(ap)

    # Aggregate
    results = {}
    for t in iou_thresholds:
        aps = all_aps[t]
        results[f"AP@{t:.2f}"] = np.mean(aps) if aps else 0.0

    results["mAP"] = np.mean([results[f"AP@{t:.2f}"] for t in iou_thresholds])
    results["mAP@50"] = results.get("AP@0.50", 0.0)
    results["mAP@75"] = results.get("AP@0.75", 0.0)

    return results


# ═══════════════════════════════════════════════════════════════════════════
# 2. Pose Estimation Evaluation (OKS / PCK)
# ═══════════════════════════════════════════════════════════════════════════

# COCO keypoint sigmas
OKS_SIGMAS = np.array([
    0.026, 0.025, 0.025, 0.035, 0.035,  # nose, eyes, ears
    0.079, 0.079, 0.072, 0.072, 0.062, 0.062,  # shoulders, elbows, wrists
    0.107, 0.107, 0.087, 0.087, 0.089, 0.089,  # hips, knees, ankles
])


def compute_oks(
    pred_keypoints: np.ndarray,
    gt_keypoints: np.ndarray,
    gt_area: float,
    sigmas: np.ndarray = None,
) -> float:
    """
    Compute Object Keypoint Similarity (OKS).
    pred/gt shape: [K, 3] where columns are (x, y, visibility)
    """
    if sigmas is None:
        sigmas = OKS_SIGMAS

    K = len(sigmas)
    visible = gt_keypoints[:K, 2] > 0

    if visible.sum() == 0:
        return 0.0

    dx = pred_keypoints[:K, 0] - gt_keypoints[:K, 0]
    dy = pred_keypoints[:K, 1] - gt_keypoints[:K, 1]
    dist_sq = dx ** 2 + dy ** 2

    s_sq = (2 * sigmas) ** 2
    scale = 2 * max(gt_area, 1) * s_sq

    exp_vals = np.exp(-dist_sq[visible] / scale[visible])
    return exp_vals.mean()


def evaluate_pose(
    predictions: List[Dict],
    ground_truth: List[Dict],
    oks_thresholds: List[float] = None,
) -> Dict[str, float]:
    """
    Evaluate pose estimation with OKS-based AP and PCK.

    predictions: list of {image_id, keypoints: [K, 3], score, area}
    ground_truth: list of {image_id, keypoints: [K, 3], area}
    """
    if oks_thresholds is None:
        oks_thresholds = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]

    # Sort predictions by score
    sorted_preds = sorted(predictions, key=lambda x: -x.get("score", 0))

    # Group GT by image
    gt_by_image: Dict[int, List[Dict]] = {}
    for gt in ground_truth:
        img_id = gt["image_id"]
        if img_id not in gt_by_image:
            gt_by_image[img_id] = []
        gt_by_image[img_id].append(gt)

    results = {}
    total_gt = len(ground_truth)

    for oks_thresh in oks_thresholds:
        tp = np.zeros(len(sorted_preds))
        matched = set()

        for pred_idx, pred in enumerate(sorted_preds):
            img_id = pred["image_id"]
            img_gts = gt_by_image.get(img_id, [])

            best_oks = 0
            best_gt_idx = -1
            for gt_idx, gt in enumerate(img_gts):
                oks = compute_oks(
                    np.array(pred["keypoints"]),
                    np.array(gt["keypoints"]),
                    gt.get("area", 1),
                )
                if oks > best_oks:
                    best_oks = oks
                    best_gt_idx = gt_idx

            if best_oks >= oks_thresh and (img_id, best_gt_idx) not in matched:
                tp[pred_idx] = 1
                matched.add((img_id, best_gt_idx))

        tp_cum = np.cumsum(tp)
        fp_cum = np.cumsum(1 - tp)
        recalls = tp_cum / max(total_gt, 1)
        precisions = tp_cum / (tp_cum + fp_cum + 1e-6)

        ap = compute_ap(precisions, recalls)
        results[f"AP@OKS{oks_thresh:.2f}"] = ap

    results["mAP"] = np.mean([results[f"AP@OKS{t:.2f}"] for t in oks_thresholds])
    results["AP@OKS0.50"] = results.get("AP@OKS0.50", 0.0)
    results["AP@OKS0.75"] = results.get("AP@OKS0.75", 0.0)

    # PCK@0.5 (Percentage of Correct Keypoints)
    threshold_px = 10  # pixels
    total_correct = 0
    total_visible = 0

    for pred, gt in zip(sorted_preds[:len(ground_truth)], ground_truth):
        pk = np.array(pred["keypoints"])
        gk = np.array(gt["keypoints"])
        visible = gk[:, 2] > 0
        if visible.sum() == 0:
            continue
        dist = np.sqrt(
            (pk[visible, 0] - gk[visible, 0]) ** 2 +
            (pk[visible, 1] - gk[visible, 1]) ** 2
        )
        total_correct += (dist < threshold_px).sum()
        total_visible += visible.sum()

    results["PCK@10px"] = total_correct / max(total_visible, 1)

    return results


# ═══════════════════════════════════════════════════════════════════════════
# 3. Classification Evaluation
# ═══════════════════════════════════════════════════════════════════════════

def evaluate_classification(
    predictions: List[int],
    ground_truth: List[int],
    class_names: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Compute accuracy, per-class precision/recall, and confusion matrix."""
    preds = np.array(predictions)
    gts = np.array(ground_truth)
    n_classes = max(preds.max(), gts.max()) + 1

    # Confusion matrix
    confusion = np.zeros((n_classes, n_classes), dtype=np.int32)
    for p, g in zip(preds, gts):
        confusion[g, p] += 1

    # Overall accuracy
    accuracy = (preds == gts).mean()

    # Per-class metrics
    per_class = {}
    for c in range(n_classes):
        tp = confusion[c, c]
        fp = confusion[:, c].sum() - tp
        fn = confusion[c, :].sum() - tp

        precision = tp / max(tp + fp, 1)
        recall = tp / max(tp + fn, 1)
        f1 = 2 * precision * recall / max(precision + recall, 1e-6)

        name = class_names[c] if class_names and c < len(class_names) else f"class_{c}"
        per_class[name] = {
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "support": int(confusion[c, :].sum()),
        }

    return {
        "accuracy": float(accuracy),
        "per_class": per_class,
        "confusion_matrix": confusion.tolist(),
        "macro_precision": np.mean([v["precision"] for v in per_class.values()]),
        "macro_recall": np.mean([v["recall"] for v in per_class.values()]),
        "macro_f1": np.mean([v["f1"] for v in per_class.values()]),
    }


# ═══════════════════════════════════════════════════════════════════════════
# 4. Full Pipeline Evaluation Report
# ═══════════════════════════════════════════════════════════════════════════

def generate_evaluation_report(
    detection_results: Dict[str, float],
    pose_results: Dict[str, float],
    classification_results: Dict[str, Any],
    output_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Generate a comprehensive evaluation report."""
    report = {
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "detection": {
            "mAP": detection_results.get("mAP", 0),
            "mAP@50": detection_results.get("mAP@50", 0),
            "mAP@75": detection_results.get("mAP@75", 0),
            "status": "pass" if detection_results.get("mAP@50", 0) > 0.7 else "needs_improvement",
        },
        "pose_estimation": {
            "mAP": pose_results.get("mAP", 0),
            "AP@OKS0.50": pose_results.get("AP@OKS0.50", 0),
            "PCK@10px": pose_results.get("PCK@10px", 0),
            "status": "pass" if pose_results.get("AP@OKS0.50", 0) > 0.7 else "needs_improvement",
        },
        "play_classification": {
            "accuracy": classification_results.get("accuracy", 0),
            "macro_f1": classification_results.get("macro_f1", 0),
            "status": "pass" if classification_results.get("accuracy", 0) > 0.8 else "needs_improvement",
        },
        "overall_status": "production_ready",
    }

    # Check overall readiness
    statuses = [
        report["detection"]["status"],
        report["pose_estimation"]["status"],
        report["play_classification"]["status"],
    ]
    if any(s == "needs_improvement" for s in statuses):
        report["overall_status"] = "needs_improvement"

    if output_path:
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2)
        logger.info(f"Evaluation report saved to {output_path}")

    return report
