# pi-ask

`pi-ask` is a CLI wrapper for cross-model consultation workflows.

It adds:
- model alias resolution (`opus`, `codex`, `gemini`, etc.)
- pre-flight model availability probe (`--probe`)
- full context pass-through (no truncation)
- Codex output cleanup (filters CLI header/noise)
- Anthropic auth recovery helpers

## Repository Layout

- `scripts/pi-ask` — main executable

## Requirements

- `bash` 4+
- `claude` CLI (for Anthropic models)
- `codex` CLI (for OpenAI/Codex/Google/xAI/Mistral routes)
- `jq` (optional, used for Anthropic OAuth token load)

## Install

```bash
git clone https://github.com/artiombell/pi-ask.git
cd pi-ask
chmod +x scripts/pi-ask
```

Optional shell alias:

```bash
alias pi-ask="$PWD/scripts/pi-ask"
```

## Usage

```bash
# List supported canonical models + aliases
scripts/pi-ask --list

# Probe availability without sending context
scripts/pi-ask opus --probe
scripts/pi-ask codex --probe

# Send context by file
scripts/pi-ask opus -f /tmp/context.md

# Send context by stdin
cat /tmp/context.md | scripts/pi-ask sonnet
```

## Exit Codes

- `0` success
- `1` model not found or ambiguous alias
- `2` model unavailable (probe failed)
- `4` context file not found
- `5` no stdin and no `-f` input

## Notes

- `pi-ask` does not enforce artificial timeouts. Let the model run until completion or interrupt with `Ctrl-C`.
- For Anthropic models, nested-session env vars are unset before invoking `claude` to allow use from agent environments.
- For non-Anthropic routes, `codex exec -m <model>` is used and noisy CLI wrappers are filtered from output.
