# ═══════════════════════════════════════════════════════════════════════════
# ScoutVision AI — Training Dockerfile
# PyTorch + CUDA for model training
# ═══════════════════════════════════════════════════════════════════════════

FROM pytorch/pytorch:2.3.0-cuda12.1-cudnn8-devel

WORKDIR /training

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Python deps
COPY packages/ai-training/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy training code
COPY packages/ai-training/ .

# Data & output directories
RUN mkdir -p /data /checkpoints /exports

ENV SCOUTVISION_DATA_DIR=/data
ENV SCOUTVISION_CHECKPOINT_DIR=/checkpoints
ENV SCOUTVISION_EXPORT_DIR=/exports

ENTRYPOINT ["python"]
CMD ["train.py", "--task", "detection", "--epochs", "100"]
