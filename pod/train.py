#!/usr/bin/env python3
"""LoRA fine-tune of Qwen3-4B-Instruct-2507 on train.chat.jsonl, loss on the assistant answer only (spec Part B).

Labels are built here (not by a trainer option) so the preflight inspects exactly what training sees:
prompt tokens are -100; supervised tokens are the answer up to and including the first <|im_end|>.

  python pod/train.py --data /workspace/train --out /workspace/out [--check-only] [--max-length 4096]
"""
import argparse
import json
import sys
from pathlib import Path

BASE = "Qwen/Qwen3-4B-Instruct-2507"
END = "<|im_end|>"
CONTROL = ["<|im_start|>", "<|im_end|>", "<|endoftext|>", "<think>", "</think>"]


def ids_of(out):
    return list(out["input_ids"] if hasattr(out, "keys") else out)


def encode(tok, rec):
    msgs = rec["messages"]
    prompt = ids_of(tok.apply_chat_template(msgs[:1], add_generation_prompt=True, tokenize=True))
    full = ids_of(tok.apply_chat_template(msgs, tokenize=True))
    end_id = tok.convert_tokens_to_ids(END)
    cut = full.index(end_id, len(prompt)) + 1  # ValueError if the answer has no end-of-turn token
    ids = full[:cut]
    return {"input_ids": ids, "attention_mask": [1] * len(ids), "labels": [-100] * len(prompt) + ids[len(prompt):]}, prompt, full


def preflight(tok, records, ceiling):
    errors, lengths = [], []
    for k, rec in enumerate(records):
        answer = rec["messages"][1]["content"]
        if not answer.strip():
            errors.append(f"{k}: empty answer")
            continue
        if any(c in answer for c in CONTROL):
            errors.append(f"{k}: answer contains template control text")
        try:
            ex, prompt, full = encode(tok, rec)
        except ValueError:
            errors.append(f"{k}: no end-of-turn token after the prompt")
            continue
        n = len(ex["input_ids"])
        lengths.append(n)
        if full[: len(prompt)] != prompt:
            errors.append(f"{k}: prompt tokens are not a prefix of the full conversation")
        if n > ceiling:
            errors.append(f"{k}: {n} tokens > ceiling {ceiling} — the answer would be truncated")
        if any(t != -100 for t in ex["labels"][: len(prompt)]):
            errors.append(f"{k}: prompt not masked")
        sup = [t for t in ex["labels"] if t != -100]
        if not sup:
            errors.append(f"{k}: no supervised tokens")
        elif tok.decode(sup) != answer + END:
            errors.append(f"{k}: supervised tokens decode to {tok.decode(sup)[:80]!r}, expected the answer + {END}")
    return errors, lengths


def load(path):
    return [json.loads(line) for line in Path(path).read_text().splitlines() if line.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", default="/workspace/out")
    ap.add_argument("--max-length", type=int, default=4096)  # fixed ceiling, not derived from the data
    ap.add_argument("--check-only", action="store_true")
    ap.add_argument("--epochs", type=float, default=3)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--rank", type=int, default=16)
    a = ap.parse_args()

    from transformers import AutoTokenizer
    tok = AutoTokenizer.from_pretrained(BASE)
    files = sorted(Path(a.data).glob("*.chat.jsonl"))
    if not files:
        sys.exit(f"no *.chat.jsonl in {a.data}")
    failed = False
    for f in files:
        records = load(f)
        if not records:
            print(f"  PREFLIGHT FAIL {f.name}: no records")
            failed = True
            continue
        errors, lengths = preflight(tok, records, a.max_length)
        lengths.sort()
        p99 = lengths[int(0.99 * (len(lengths) - 1))] if lengths else 0
        print(f"{f.name}: {len(lengths)} records, max {lengths[-1] if lengths else 0} tokens, p99 {p99}, ceiling {a.max_length}")
        for e in errors[:20]:
            print("  PREFLIGHT FAIL", e)
        failed |= bool(errors)
    if failed:
        sys.exit("preflight failed — not training")
    print("preflight OK")
    if a.check_only:
        return

    import torch
    from peft import LoraConfig, get_peft_model
    from transformers import AutoModelForCausalLM, DataCollatorForSeq2Seq, Trainer, TrainingArguments

    train = [encode(tok, r)[0] for r in load(Path(a.data) / "train.chat.jsonl")]
    val = [encode(tok, r)[0] for r in load(Path(a.data) / "val.chat.jsonl")]
    model = AutoModelForCausalLM.from_pretrained(BASE, torch_dtype=torch.bfloat16)
    model.gradient_checkpointing_enable()
    model.enable_input_require_grads()
    model = get_peft_model(model, LoraConfig(r=a.rank, lora_alpha=2 * a.rank, lora_dropout=0.05,
                                             target_modules="all-linear", task_type="CAUSAL_LM"))
    model.print_trainable_parameters()
    args = TrainingArguments(
        output_dir=a.out, num_train_epochs=a.epochs, learning_rate=a.lr, lr_scheduler_type="cosine", warmup_ratio=0.03,
        per_device_train_batch_size=4, per_device_eval_batch_size=4, gradient_accumulation_steps=4,
        eval_strategy="epoch", save_strategy="epoch", logging_steps=10, bf16=True, report_to=[], seed=42,
    )
    trainer = Trainer(model=model, args=args, train_dataset=train, eval_dataset=val,
                      data_collator=DataCollatorForSeq2Seq(tok, label_pad_token_id=-100, padding=True))
    trainer.train()
    evals = [h for h in trainer.state.log_history if "eval_loss" in h]
    best = min(evals, key=lambda h: h["eval_loss"])
    chosen = Path(a.out, f"checkpoint-{best['step']}")  # by step, not by position: safe with leftovers from an earlier run
    if not chosen.exists():
        sys.exit(f"expected checkpoint {chosen} for the best eval step is missing")
    metrics = {"val_loss_per_epoch": [h["eval_loss"] for h in evals], "chosen_epoch": best["epoch"], "chosen_checkpoint": str(chosen)}
    Path(a.out, "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
