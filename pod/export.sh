#!/usr/bin/env bash
# Merge the chosen LoRA checkpoint into the base model and export GGUF q8_0 (same quantisation as the baseline).
#   bash pod/export.sh /workspace/out/checkpoint-NNN
set -euo pipefail
ADAPTER="$1"; OUT=/workspace/out; LLAMA=/workspace/llama.cpp
python - "$ADAPTER" "$OUT/merged" <<'PY'
import sys, torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer
base = "Qwen/Qwen3-4B-Instruct-2507"
model = AutoModelForCausalLM.from_pretrained(base, torch_dtype=torch.bfloat16)
PeftModel.from_pretrained(model, sys.argv[1]).merge_and_unload().save_pretrained(sys.argv[2])
AutoTokenizer.from_pretrained(base).save_pretrained(sys.argv[2])
PY
[ -d "$LLAMA" ] || git clone --depth 1 --branch v0.7.0 https://github.com/ggml-org/llama.cpp "$LLAMA"
# The converter pins its own transformers/torch: give it a separate venv so the training venv stays intact.
[ -d /workspace/venv-convert ] || python -m venv /workspace/venv-convert
/workspace/venv-convert/bin/pip install -q -r "$LLAMA/requirements/requirements-convert_hf_to_gguf.txt"
/workspace/venv-convert/bin/python "$LLAMA/convert_hf_to_gguf.py" "$OUT/merged" --outtype q8_0 --outfile "$OUT/abap-sql-qwen3-4b-ft.q8_0.gguf"
cd "$OUT" && sha256sum abap-sql-qwen3-4b-ft.q8_0.gguf | tee abap-sql-qwen3-4b-ft.q8_0.gguf.sha256  # relative name, so shasum -c works on the Mac
