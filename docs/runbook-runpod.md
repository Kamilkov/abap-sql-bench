# Runbook (first-timer edition)

Training data comes from open-weight models through **OpenRouter** (pay per token, no GPU): the teacher
DeepSeek-V4-Pro writes the pairs, GLM-5.2 cross-checks them. Only the **training** needs a rented GPU on
**Runpod**. Every euro spent goes into `results/costs.md`.

> Runpod billing in one line: a **running** Pod bills GPU + disk; a **stopped** Pod bills only its volume
> disk; a **terminated** Pod bills nothing and its data is gone. Terminate when you're done.

## 0. One-time setup (on the Mac)

1. **OpenRouter:** sign up at openrouter.ai → **Credits** → add **$20**. In **Settings → Privacy** leave
   "allow providers that may train on your prompts" **off**.
2. **Keys → Create Key**, name `abap-sql-bench`, **credit limit $25**. This caps OpenRouter only; Runpod,
   Voyage embeddings and everything else still count toward the project budget (stop and ask at a
   projected €30, hard ceiling €35).
   Copy the key once, open `~/.config/ai/secrets.env` in an editor and add a line
   `ABAP_SQL_BENCH__TEACHER_API_KEY=<the key>`. (Type it yourself; Claude never sees or writes this value.)
3. **SSH key for Runpod** (needed only for training). If you have none: `ssh-keygen -t ed25519` (Enter for
   the defaults). Runpod console → **Settings / Credentials** → **SSH Public Keys** → paste the contents of
   `~/.ssh/id_ed25519.pub` (the whole line starting with `ssh-ed25519`, not a fingerprint).
4. Hugging Face login is **not needed**: the student model is public.

## 1. Generate the training data (Mac only, no Pod)

Health check — should print `OK` for both models (two tiny calls, < $0.01; it loads only the teacher key).
Each `OK` means the live response came from DeepInfra, from the pinned model, with **0 reasoning tokens**;
the line under it shows the evidence. If OpenRouter refuses the routing policy (zero data retention +
distillation allowed), it prints `FAILED — HTTP 4xx …`: stop and tell Claude — never loosen the policy to
make it pass. The same applies if `teach.ts` or `crosscheck.ts` ends with `FATAL — … stopped`.

```
cd ~/Code/Working/abap-sql-bench && node scripts/teacher-health.ts
```

Then run the pilot / generation steps from the plan (Task 11 / 12). Every call (id, model, provider,
usage, cost, accepted or rejected) is logged in `train/teacher-calls.jsonl`. After each run, add the spend
(openrouter.ai → **Activity**) to `results/costs.md`.

## 2. Create the Pod (training)

1. Runpod console → **Pods** → **Deploy**.
2. GPU: one **48 GB** card (L40S, RTX A6000 or A40 class). Note the hourly price.
3. Template: **Runpod PyTorch** (official; has SSH preconfigured).
4. **Volume Disk: 80 GB** (student weights, checkpoints, merged model and GGUF).
5. **Ports:** keep **TCP 22** (SSH). **Remove every HTTP port** the template adds (e.g. 8888 for Jupyter) and add none —
   the Pod must be reachable only over SSH.
6. **Environment Variables:** add `HF_HOME=/workspace/hf` so downloaded models survive a stop.
7. **Deploy**. Wait until the Pod shows **Running**. Write the start time into `results/costs.md`.

## 3. Connect

1. Pods → your Pod → **Connect** → copy the command under **SSH over exposed TCP**, e.g.
   `ssh root@<pod-ip> -p <port> -i ~/.ssh/id_ed25519`. You should get a `root@…` prompt.
2. Copy the Pod scripts from the Mac (new Mac terminal, same IP/port):
   `scp -P <port> -i ~/.ssh/id_ed25519 -r ~/Code/Working/abap-sql-bench/pod root@<ip>:/workspace/`

## 4. Train (on the Pod)

From the Mac, copy the training data:

```
scp -P <port> -i ~/.ssh/id_ed25519 ~/Code/Working/abap-sql-bench/train/train.chat.jsonl ~/Code/Working/abap-sql-bench/train/val.chat.jsonl root@<ip>:/workspace/train/
```

(Create the folder first on the Pod: `mkdir -p /workspace/train`.) On the Pod:

```
python -m venv --system-site-packages /workspace/venv-train && source /workspace/venv-train/bin/activate
pip install -r /workspace/pod/requirements-train.txt
python /workspace/pod/train.py --data /workspace/train --check-only      # must end with "preflight OK"
python /workspace/pod/train.py --data /workspace/train --out /workspace/out
```

Training prints the validation loss per epoch and writes `/workspace/out/metrics.json` with the chosen
checkpoint. Then export:

```
bash /workspace/pod/export.sh <chosen_checkpoint from metrics.json>
```

It ends by printing the GGUF's sha256.

## 5. Bring the model home (Mac) — before anything is terminated

On the Pod, pack the chosen adapter checkpoint (its path is in `metrics.json`) next to the GGUF:

```
cd /workspace/out && tar czf adapter.tar.gz -C "$(dirname <chosen_checkpoint>)" "$(basename <chosen_checkpoint>)" && sha256sum adapter.tar.gz > adapter.tar.gz.sha256
```

On the Mac (one quoted remote path per file — modern `scp` does not expand `{a,b}` lists on the remote side):

```
mkdir -p ~/Code/Working/abap-sql-bench/models/ft
scp -P <port> -i ~/.ssh/id_ed25519 'root@<ip>:/workspace/out/abap-sql-qwen3-4b-ft.q8_0.gguf' 'root@<ip>:/workspace/out/abap-sql-qwen3-4b-ft.q8_0.gguf.sha256' 'root@<ip>:/workspace/out/adapter.tar.gz' 'root@<ip>:/workspace/out/adapter.tar.gz.sha256' 'root@<ip>:/workspace/out/metrics.json' ~/Code/Working/abap-sql-bench/models/ft/
cd ~/Code/Working/abap-sql-bench/models/ft && shasum -a 256 -c abap-sql-qwen3-4b-ft.q8_0.gguf.sha256 && shasum -a 256 -c adapter.tar.gz.sha256
cp ../../pod/Modelfile . && ollama create abap-sql-qwen3-4b-ft:q8_0 -f Modelfile
```

Both `shasum -c` lines must print `OK`. **Do not terminate the Pod until they do** — the adapter and the GGUF
exist nowhere else. The large files are git-ignored; their hashes are what gets committed.

The Ollama tag is `abap-sql-qwen3-4b-ft:q8_0`; its **registry key** (models.json, answers file names, the
`models/ft-v1.json` marker) is the sanitised `abap-sql-qwen3-4b-ft-q8_0`.

## 6. Finish

1. Only after both `OK`s in step 5: Pods → your Pod → **Terminate** (trash icon). This deletes the volume.
2. Add the end time and cost (hours × hourly price) to `results/costs.md`.
