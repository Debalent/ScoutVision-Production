"""
═══════════════════════════════════════════════════════════════════════════
ScoutVision AI Training — Model Export & Optimization
ONNX export, quantization, TensorRT conversion, and benchmarking.
═══════════════════════════════════════════════════════════════════════════
"""

import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger("scoutvision.export")


# ═══════════════════════════════════════════════════════════════════════════
# 1. ONNX Export
# ═══════════════════════════════════════════════════════════════════════════

def export_to_onnx(
    model,
    dummy_input,
    output_path: str,
    input_names: List[str] = None,
    output_names: List[str] = None,
    dynamic_axes: Dict = None,
    opset_version: int = 17,
    simplify: bool = True,
) -> str:
    """Export PyTorch model to ONNX format."""
    import torch

    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    model.eval()
    with torch.no_grad():
        torch.onnx.export(
            model,
            dummy_input,
            str(path),
            opset_version=opset_version,
            input_names=input_names or ["input"],
            output_names=output_names or ["output"],
            dynamic_axes=dynamic_axes or {},
            do_constant_folding=True,
        )

    logger.info(f"Exported ONNX model to {path}")

    # Simplify
    if simplify:
        try:
            import onnx
            from onnxsim import simplify as onnx_simplify

            model_onnx = onnx.load(str(path))
            model_simp, check = onnx_simplify(model_onnx)
            if check:
                onnx.save(model_simp, str(path))
                logger.info("ONNX model simplified successfully")
            else:
                logger.warning("ONNX simplification check failed")
        except ImportError:
            logger.info("onnxsim not available, skipping simplification")

    return str(path)


# ═══════════════════════════════════════════════════════════════════════════
# 2. Quantization
# ═══════════════════════════════════════════════════════════════════════════

def quantize_onnx(
    model_path: str,
    output_path: str,
    quantization_type: str = "dynamic",  # dynamic, static, int8
    calibration_data: Optional[List[np.ndarray]] = None,
) -> str:
    """Quantize ONNX model for faster inference."""
    import onnx
    from onnxruntime.quantization import (
        quantize_dynamic,
        quantize_static,
        QuantType,
        CalibrationDataReader,
    )

    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    if quantization_type == "dynamic":
        quantize_dynamic(
            model_path,
            str(path),
            weight_type=QuantType.QInt8,
        )
        logger.info(f"Dynamic quantization complete: {path}")

    elif quantization_type == "static" and calibration_data:
        class CalibReader(CalibrationDataReader):
            def __init__(self, data):
                self.data = iter(data)

            def get_next(self):
                try:
                    return {"input": next(self.data)}
                except StopIteration:
                    return None

        quantize_static(
            model_path,
            str(path),
            CalibReader(calibration_data),
            quant_format=QuantType.QInt8,
        )
        logger.info(f"Static quantization complete: {path}")

    elif quantization_type == "int8":
        quantize_dynamic(
            model_path,
            str(path),
            weight_type=QuantType.QInt8,
        )
        logger.info(f"INT8 quantization complete: {path}")

    else:
        logger.warning(f"Unknown quantization type: {quantization_type}")
        return model_path

    # Compare sizes
    orig_size = Path(model_path).stat().st_size / (1024 * 1024)
    quant_size = path.stat().st_size / (1024 * 1024)
    logger.info(f"Model size: {orig_size:.1f}MB → {quant_size:.1f}MB ({quant_size/orig_size*100:.0f}%)")

    return str(path)


# ═══════════════════════════════════════════════════════════════════════════
# 3. TensorRT Conversion
# ═══════════════════════════════════════════════════════════════════════════

def convert_to_tensorrt(
    onnx_path: str,
    output_path: str,
    fp16: bool = True,
    int8: bool = False,
    max_batch_size: int = 8,
    workspace_size_mb: int = 4096,
    calibration_data: Optional[List[np.ndarray]] = None,
) -> Optional[str]:
    """Convert ONNX model to TensorRT engine."""
    try:
        import tensorrt as trt
    except ImportError:
        logger.warning("TensorRT not available. Skipping conversion.")
        return None

    TRT_LOGGER = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(TRT_LOGGER)
    network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
    parser = trt.OnnxParser(network, TRT_LOGGER)

    # Parse ONNX
    with open(onnx_path, "rb") as f:
        if not parser.parse(f.read()):
            for i in range(parser.num_errors):
                logger.error(f"TensorRT parse error: {parser.get_error(i)}")
            return None

    # Build config
    config = builder.create_builder_config()
    config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, workspace_size_mb * (1 << 20))

    if fp16 and builder.platform_has_fast_fp16:
        config.set_flag(trt.BuilderFlag.FP16)
        logger.info("TensorRT: FP16 mode enabled")

    if int8 and builder.platform_has_fast_int8:
        config.set_flag(trt.BuilderFlag.INT8)
        logger.info("TensorRT: INT8 mode enabled")

    # Build engine
    logger.info("Building TensorRT engine (this may take several minutes)...")
    engine = builder.build_serialized_network(network, config)

    if engine is None:
        logger.error("TensorRT engine build failed")
        return None

    # Save
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(str(path), "wb") as f:
        f.write(engine)

    logger.info(f"TensorRT engine saved to {path}")
    return str(path)


# ═══════════════════════════════════════════════════════════════════════════
# 4. Benchmarking
# ═══════════════════════════════════════════════════════════════════════════

def benchmark_onnx(
    model_path: str,
    input_shape: Tuple[int, ...],
    num_iterations: int = 100,
    warmup: int = 10,
    providers: List[str] = None,
) -> Dict[str, float]:
    """Benchmark ONNX model inference speed."""
    import onnxruntime as ort

    if providers is None:
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]

    session = ort.InferenceSession(model_path, providers=providers)
    input_name = session.get_inputs()[0].name
    dummy = np.random.randn(*input_shape).astype(np.float32)

    # Warmup
    for _ in range(warmup):
        session.run(None, {input_name: dummy})

    # Benchmark
    latencies = []
    for _ in range(num_iterations):
        start = time.perf_counter()
        session.run(None, {input_name: dummy})
        latencies.append((time.perf_counter() - start) * 1000)

    latencies = np.array(latencies)

    results = {
        "model": str(model_path),
        "input_shape": list(input_shape),
        "provider": session.get_providers()[0],
        "num_iterations": num_iterations,
        "mean_ms": float(latencies.mean()),
        "median_ms": float(np.median(latencies)),
        "p95_ms": float(np.percentile(latencies, 95)),
        "p99_ms": float(np.percentile(latencies, 99)),
        "min_ms": float(latencies.min()),
        "max_ms": float(latencies.max()),
        "throughput_fps": float(1000 / latencies.mean()),
    }

    logger.info(
        f"Benchmark {Path(model_path).name}: "
        f"mean={results['mean_ms']:.1f}ms, "
        f"p95={results['p95_ms']:.1f}ms, "
        f"throughput={results['throughput_fps']:.1f} fps"
    )

    return results


def benchmark_suite(
    models_dir: str,
    output_file: Optional[str] = None,
) -> List[Dict[str, float]]:
    """Run benchmarks on all ONNX models in a directory."""
    models_path = Path(models_dir)
    results = []

    # Default input shapes by model name pattern
    shape_map = {
        "detect": (1, 3, 1280, 1280),
        "pose": (1, 3, 256, 192),
        "track": (1, 3, 128, 256),
        "plays": (1, 64, 256),
        "highlight": (1, 3, 32, 224, 224),
    }

    for onnx_file in models_path.glob("*.onnx"):
        # Determine input shape
        shape = (1, 3, 640, 640)  # default
        for key, s in shape_map.items():
            if key in onnx_file.stem:
                shape = s
                break

        try:
            result = benchmark_onnx(str(onnx_file), shape)
            results.append(result)
        except Exception as e:
            logger.error(f"Benchmark failed for {onnx_file.name}: {e}")

    if output_file:
        import json
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
        logger.info(f"Benchmark results saved to {output_file}")

    return results


# ═══════════════════════════════════════════════════════════════════════════
# 5. Optimization Pipeline
# ═══════════════════════════════════════════════════════════════════════════

def optimize_for_production(
    pytorch_model,
    dummy_input,
    output_dir: str,
    model_name: str = "model",
    enable_quantization: bool = True,
    enable_tensorrt: bool = False,
) -> Dict[str, str]:
    """
    Full optimization pipeline:
    PyTorch → ONNX → Quantize → (optional) TensorRT → Benchmark
    """
    out = Path(output_dir) / model_name
    out.mkdir(parents=True, exist_ok=True)
    results = {}

    # Step 1: ONNX export
    onnx_path = export_to_onnx(
        pytorch_model,
        dummy_input,
        str(out / f"{model_name}.onnx"),
    )
    results["onnx"] = onnx_path

    # Step 2: Quantization
    if enable_quantization:
        quant_path = quantize_onnx(
            onnx_path,
            str(out / f"{model_name}_int8.onnx"),
            quantization_type="dynamic",
        )
        results["quantized"] = quant_path

    # Step 3: TensorRT
    if enable_tensorrt:
        trt_path = convert_to_tensorrt(
            onnx_path,
            str(out / f"{model_name}.engine"),
        )
        if trt_path:
            results["tensorrt"] = trt_path

    # Step 4: Benchmark all variants
    for variant, path in results.items():
        if path and path.endswith((".onnx",)):
            try:
                import torch
                shape = tuple(dummy_input.shape) if hasattr(dummy_input, 'shape') else (1, 3, 640, 640)
                bench = benchmark_onnx(path, shape, num_iterations=50)
                logger.info(f"{variant}: {bench['mean_ms']:.1f}ms avg")
            except Exception as e:
                logger.warning(f"Benchmark failed for {variant}: {e}")

    return results
