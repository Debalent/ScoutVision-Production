"""
═══════════════════════════════════════════════════════════════════════════
ScoutVision AI Training — Training Loops
Unified training framework for detection, pose, and classification models.
═══════════════════════════════════════════════════════════════════════════
"""

import os
import time
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import yaml
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader

logger = logging.getLogger("scoutvision.train")


# ═══════════════════════════════════════════════════════════════════════════
# Training State
# ═══════════════════════════════════════════════════════════════════════════

class TrainingState:
    """Tracks training progress and metrics."""

    def __init__(self):
        self.epoch: int = 0
        self.global_step: int = 0
        self.best_metric: float = 0.0
        self.best_epoch: int = 0
        self.train_losses: List[float] = []
        self.val_metrics: List[Dict[str, float]] = []

    def update_best(self, metric: float, epoch: int) -> bool:
        if metric > self.best_metric:
            self.best_metric = metric
            self.best_epoch = epoch
            return True
        return False


# ═══════════════════════════════════════════════════════════════════════════
# Base Trainer
# ═══════════════════════════════════════════════════════════════════════════

class BaseTrainer:
    """
    Base training loop with AMP, gradient accumulation,
    checkpointing, and logging.
    """

    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        config: Dict[str, Any],
        device: str = "cuda",
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config = config
        self.device = device

        # Optimizer
        self.optimizer = self._build_optimizer()
        self.scheduler = self._build_scheduler()

        # AMP
        self.use_amp = config.get("hardware", {}).get("amp", True)
        self.scaler = GradScaler(enabled=self.use_amp)

        # Gradient accumulation
        self.grad_accum = config.get("hardware", {}).get("gradient_accumulation", 1)

        # State
        self.state = TrainingState()
        self.checkpoint_dir = Path(config.get("logging", {}).get("checkpoint_dir", "./checkpoints"))
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

        # Logging
        self.log_interval = config.get("logging", {}).get("log_interval", 50)
        self.save_interval = config.get("logging", {}).get("save_interval", 5)

        # Optional: WandB
        self.wandb_run = None
        if config.get("logging", {}).get("backend") == "wandb":
            try:
                import wandb
                self.wandb_run = wandb.init(
                    project=config["logging"].get("project", "scoutvision"),
                    config=config,
                )
            except Exception as e:
                logger.warning(f"WandB init failed: {e}")

    def _build_optimizer(self) -> optim.Optimizer:
        opt_cfg = self.config.get("optimizer", {})
        opt_type = opt_cfg.get("type", "AdamW")
        lr = opt_cfg.get("lr", 0.001)
        wd = opt_cfg.get("weight_decay", 0.0005)

        if opt_type == "AdamW":
            return optim.AdamW(self.model.parameters(), lr=lr, weight_decay=wd)
        elif opt_type == "Adam":
            return optim.Adam(self.model.parameters(), lr=lr)
        elif opt_type == "SGD":
            return optim.SGD(
                self.model.parameters(), lr=lr,
                momentum=opt_cfg.get("momentum", 0.9), weight_decay=wd,
            )
        else:
            return optim.AdamW(self.model.parameters(), lr=lr, weight_decay=wd)

    def _build_scheduler(self) -> Optional[Any]:
        sched_cfg = self.config.get("scheduler", {})
        sched_type = sched_cfg.get("type", "cosine")

        epochs = self.config.get("epochs", 100)

        if sched_type == "cosine":
            return optim.lr_scheduler.CosineAnnealingLR(
                self.optimizer, T_max=epochs,
                eta_min=sched_cfg.get("min_lr", 1e-6),
            )
        elif sched_type == "step":
            return optim.lr_scheduler.StepLR(
                self.optimizer,
                step_size=sched_cfg.get("step_size", 30),
                gamma=sched_cfg.get("gamma", 0.1),
            )
        return None

    def train(self, epochs: int = None) -> TrainingState:
        """Run full training loop."""
        num_epochs = epochs or self.config.get("epochs", 100)
        warmup_epochs = self.config.get("scheduler", {}).get("warmup_epochs", 0)

        logger.info(f"Starting training for {num_epochs} epochs")
        logger.info(f"Model params: {sum(p.numel() for p in self.model.parameters()):,}")

        for epoch in range(self.state.epoch, num_epochs):
            self.state.epoch = epoch

            # Warmup learning rate
            if epoch < warmup_epochs:
                warmup_lr = self.config.get("optimizer", {}).get("lr", 0.001) * (epoch + 1) / warmup_epochs
                for pg in self.optimizer.param_groups:
                    pg["lr"] = warmup_lr

            # Train one epoch
            train_loss = self._train_epoch(epoch)
            self.state.train_losses.append(train_loss)

            # Validate
            val_metrics = self._validate(epoch)
            self.state.val_metrics.append(val_metrics)

            # Update scheduler
            if self.scheduler and epoch >= warmup_epochs:
                self.scheduler.step()

            # Check for best model
            primary_metric = val_metrics.get("mAP", val_metrics.get("AP", val_metrics.get("accuracy", 0)))
            is_best = self.state.update_best(primary_metric, epoch)

            # Logging
            lr = self.optimizer.param_groups[0]["lr"]
            logger.info(
                f"Epoch {epoch}/{num_epochs} | "
                f"Loss: {train_loss:.4f} | "
                f"Metric: {primary_metric:.4f} | "
                f"Best: {self.state.best_metric:.4f} (ep {self.state.best_epoch}) | "
                f"LR: {lr:.6f}"
            )

            if self.wandb_run:
                import wandb
                wandb.log({
                    "epoch": epoch,
                    "train_loss": train_loss,
                    "lr": lr,
                    **{f"val/{k}": v for k, v in val_metrics.items()},
                })

            # Save checkpoint
            if (epoch + 1) % self.save_interval == 0 or is_best:
                self._save_checkpoint(epoch, is_best)

        # Export final model
        self._export_model()

        logger.info(f"Training complete. Best metric: {self.state.best_metric:.4f} at epoch {self.state.best_epoch}")
        return self.state

    def _train_epoch(self, epoch: int) -> float:
        """Train for one epoch. Override compute_loss in subclass."""
        self.model.train()
        total_loss = 0.0
        num_batches = 0

        self.optimizer.zero_grad()

        for batch_idx, batch in enumerate(self.train_loader):
            batch = self._to_device(batch)

            with autocast(enabled=self.use_amp):
                loss = self.compute_loss(batch)
                loss = loss / self.grad_accum

            self.scaler.scale(loss).backward()

            if (batch_idx + 1) % self.grad_accum == 0:
                self.scaler.unscale_(self.optimizer)
                nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=10.0)
                self.scaler.step(self.optimizer)
                self.scaler.update()
                self.optimizer.zero_grad()

            total_loss += loss.item() * self.grad_accum
            num_batches += 1
            self.state.global_step += 1

            if batch_idx % self.log_interval == 0:
                logger.debug(f"  Batch {batch_idx}/{len(self.train_loader)} | Loss: {loss.item() * self.grad_accum:.4f}")

        return total_loss / max(1, num_batches)

    @torch.no_grad()
    def _validate(self, epoch: int) -> Dict[str, float]:
        """Validate model. Override in subclass for custom metrics."""
        self.model.eval()
        total_loss = 0.0
        num_batches = 0

        for batch in self.val_loader:
            batch = self._to_device(batch)
            with autocast(enabled=self.use_amp):
                loss = self.compute_loss(batch)
            total_loss += loss.item()
            num_batches += 1

        return {"val_loss": total_loss / max(1, num_batches)}

    def compute_loss(self, batch: Dict[str, Any]) -> torch.Tensor:
        """Override in subclass."""
        raise NotImplementedError

    def _to_device(self, batch: Any) -> Any:
        if isinstance(batch, dict):
            return {k: self._to_device(v) for k, v in batch.items()}
        if isinstance(batch, list):
            return [self._to_device(v) for v in batch]
        if isinstance(batch, torch.Tensor):
            return batch.to(self.device, non_blocking=True)
        return batch

    def _save_checkpoint(self, epoch: int, is_best: bool = False):
        ckpt = {
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "state": {
                "best_metric": self.state.best_metric,
                "best_epoch": self.state.best_epoch,
                "global_step": self.state.global_step,
            },
        }
        path = self.checkpoint_dir / f"checkpoint_ep{epoch}.pt"
        torch.save(ckpt, path)
        logger.info(f"Saved checkpoint: {path}")

        if is_best:
            best_path = self.checkpoint_dir / "best_model.pt"
            torch.save(ckpt, best_path)
            logger.info(f"Saved best model: {best_path}")

    def _export_model(self):
        """Export model to ONNX."""
        export_dir = Path(self.config.get("logging", {}).get("export_dir", "./exports"))
        export_dir.mkdir(parents=True, exist_ok=True)

        formats = self.config.get("logging", {}).get("export_formats", ["onnx"])

        if "onnx" in formats:
            self._export_onnx(export_dir)

    def _export_onnx(self, export_dir: Path):
        """Export model to ONNX format. Override for custom input shapes."""
        logger.info("ONNX export — override _export_onnx() for custom input shapes")


# ═══════════════════════════════════════════════════════════════════════════
# Detection Trainer
# ═══════════════════════════════════════════════════════════════════════════

class DetectionTrainer(BaseTrainer):
    """Training loop for YOLOv8-style detection models."""

    def compute_loss(self, batch: Dict[str, Any]) -> torch.Tensor:
        images = batch["images"]
        targets = batch.get("targets", [])

        # Forward pass through detection model
        outputs = self.model(images)

        # Compute YOLOv8 losses (cls + box + dfl)
        if hasattr(self.model, "compute_loss"):
            return self.model.compute_loss(outputs, targets)

        # Fallback: simple MSE for prototype
        return torch.tensor(0.0, device=self.device, requires_grad=True)

    @torch.no_grad()
    def _validate(self, epoch: int) -> Dict[str, float]:
        self.model.eval()
        all_preds = []
        all_targets = []

        for batch in self.val_loader:
            batch = self._to_device(batch)
            outputs = self.model(batch["images"])
            # Collect predictions for mAP calculation
            all_preds.append(outputs)
            all_targets.append(batch.get("targets", []))

        # Compute mAP (simplified)
        mAP = self._compute_map(all_preds, all_targets)
        return {"mAP": mAP, "mAP@50": mAP}

    def _compute_map(self, preds, targets) -> float:
        """Placeholder for COCO mAP evaluation."""
        # In production: use pycocotools COCOeval
        return 0.0

    def _export_onnx(self, export_dir: Path):
        input_size = self.config.get("input_size", 1280)
        dummy = torch.randn(1, 3, input_size, input_size, device=self.device)
        path = export_dir / "sv-detect-v1.onnx"
        try:
            torch.onnx.export(
                self.model, dummy, str(path),
                opset_version=17,
                input_names=["images"],
                output_names=["detections"],
                dynamic_axes={"images": {0: "batch"}, "detections": {0: "batch"}},
            )
            logger.info(f"Exported detection model to {path}")
        except Exception as e:
            logger.error(f"ONNX export failed: {e}")


# ═══════════════════════════════════════════════════════════════════════════
# Pose Trainer
# ═══════════════════════════════════════════════════════════════════════════

class PoseTrainer(BaseTrainer):
    """Training loop for HRNet/ViTPose pose estimation."""

    def compute_loss(self, batch: Dict[str, Any]) -> torch.Tensor:
        images = batch["image"]
        target_heatmaps = batch["heatmaps"]
        visibility = batch.get("visibility", None)

        pred_heatmaps = self.model(images)

        # MSE loss on heatmaps, masked by visibility
        if visibility is not None:
            # visibility shape: [B, K] → [B, K, 1, 1]
            vis_mask = visibility.unsqueeze(-1).unsqueeze(-1)
            loss = ((pred_heatmaps - target_heatmaps) ** 2 * vis_mask).mean()
        else:
            loss = nn.functional.mse_loss(pred_heatmaps, target_heatmaps)

        return loss

    @torch.no_grad()
    def _validate(self, epoch: int) -> Dict[str, float]:
        self.model.eval()
        total_loss = 0.0
        total_correct = 0
        total_visible = 0

        for batch in self.val_loader:
            batch = self._to_device(batch)
            images = batch["image"]
            target_heatmaps = batch["heatmaps"]
            keypoints = batch["keypoints"]
            visibility = batch.get("visibility", None)

            pred_heatmaps = self.model(images)
            loss = nn.functional.mse_loss(pred_heatmaps, target_heatmaps)
            total_loss += loss.item()

            # PCK@0.5 (Percentage of Correct Keypoints)
            B, K, H, W = pred_heatmaps.shape
            pred_coords = self._heatmap_to_coords(pred_heatmaps)  # [B, K, 2]
            gt_coords = keypoints[:, :, :2]

            # Check if predictions are within threshold
            dist = torch.norm(pred_coords - gt_coords, dim=-1)  # [B, K]
            threshold = 10.0  # pixels

            if visibility is not None:
                correct = ((dist < threshold) & (visibility > 0)).sum().item()
                visible = (visibility > 0).sum().item()
            else:
                correct = (dist < threshold).sum().item()
                visible = dist.numel()

            total_correct += correct
            total_visible += visible

        pck = total_correct / max(1, total_visible)
        return {
            "val_loss": total_loss / max(1, len(self.val_loader)),
            "PCK@0.5": pck,
            "AP": pck,  # Use PCK as primary metric
        }

    def _heatmap_to_coords(self, heatmaps: torch.Tensor) -> torch.Tensor:
        """Convert heatmaps to keypoint coordinates via argmax."""
        B, K, H, W = heatmaps.shape
        flat = heatmaps.reshape(B, K, -1)
        max_idx = flat.argmax(dim=-1)
        x = (max_idx % W).float()
        y = (max_idx // W).float()
        return torch.stack([x, y], dim=-1)

    def _export_onnx(self, export_dir: Path):
        h, w = self.config.get("input_size", [256, 192])
        dummy = torch.randn(1, 3, h, w, device=self.device)
        path = export_dir / "sv-pose-v1.onnx"
        try:
            torch.onnx.export(
                self.model, dummy, str(path),
                opset_version=17,
                input_names=["images"],
                output_names=["heatmaps"],
                dynamic_axes={"images": {0: "batch"}, "heatmaps": {0: "batch"}},
            )
            logger.info(f"Exported pose model to {path}")
        except Exception as e:
            logger.error(f"ONNX export failed: {e}")


# ═══════════════════════════════════════════════════════════════════════════
# Play Classification Trainer
# ═══════════════════════════════════════════════════════════════════════════

class PlayClassificationTrainer(BaseTrainer):
    """Training loop for temporal play classification."""

    def compute_loss(self, batch: Dict[str, Any]) -> torch.Tensor:
        features = batch["features"]  # [B, T, D]
        labels = batch["label"]        # [B]
        mask = batch.get("mask", None)  # [B, T]

        logits = self.model(features, mask=mask)
        return nn.functional.cross_entropy(logits, labels)

    @torch.no_grad()
    def _validate(self, epoch: int) -> Dict[str, float]:
        self.model.eval()
        total_loss = 0.0
        correct = 0
        total = 0

        for batch in self.val_loader:
            batch = self._to_device(batch)
            features = batch["features"]
            labels = batch["label"]
            mask = batch.get("mask", None)

            logits = self.model(features, mask=mask)
            loss = nn.functional.cross_entropy(logits, labels)
            total_loss += loss.item()

            preds = logits.argmax(dim=-1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        return {
            "val_loss": total_loss / max(1, len(self.val_loader)),
            "accuracy": correct / max(1, total),
        }


# ═══════════════════════════════════════════════════════════════════════════
# Training Script Entry Point
# ═══════════════════════════════════════════════════════════════════════════

def load_config(config_path: str) -> Dict[str, Any]:
    """Load training configuration from YAML."""
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def setup_logging(level: str = "INFO"):
    """Configure logging for training."""
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="ScoutVision AI Training")
    parser.add_argument("--config", type=str, default="config.yaml", help="Config file path")
    parser.add_argument("--task", type=str, required=True,
                       choices=["detection", "pose", "play_classification"],
                       help="Training task")
    parser.add_argument("--data-dir", type=str, required=True, help="Data directory")
    parser.add_argument("--device", type=str, default="cuda", help="Device")
    parser.add_argument("--resume", type=str, default=None, help="Resume from checkpoint")
    args = parser.parse_args()

    setup_logging()
    config = load_config(args.config)

    logger.info(f"ScoutVision Training — Task: {args.task}")
    logger.info(f"Config: {args.config}")
    logger.info(f"Device: {args.device}")
    logger.info(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")

    # Task-specific training would be dispatched here
    logger.info("Training configuration loaded. Ready to train.")
