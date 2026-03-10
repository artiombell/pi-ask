# pi-ask

`pi-ask` is both:
- a standalone CLI wrapper (`scripts/pi-ask`) for cross-model consultation
- an installable Oh My Pi plugin tool (`pi_ask`)

## Features

- model alias resolution (`opus`, `codex`, `gemini`, etc.)
- pre-flight model availability probe (`--probe`)
- full context pass-through (no truncation)
- Codex output cleanup (filters CLI header/noise)
- Anthropic auth recovery helpers
- plugin packaging via `package.json` + `omp.tools` manifest

## Repository Layout

- `scripts/pi-ask` — standalone CLI executable
- `tools/pi-ask.ts` — Oh My Pi plugin custom tool module
- `package.json` — npm/package metadata + OMP plugin manifest

## Requirements

- `bash` 4+
- `claude` CLI (for Anthropic models)
- `codex` CLI (for OpenAI/Codex/Google/xAI/Mistral routes)
- `jq` (optional, used for Anthropic OAuth token load)

## Standalone CLI Usage

```bash
# clone
git clone https://github.com/artiombell/pi-ask.git
cd pi-ask
chmod +x scripts/pi-ask

# list models known to the wrapper
scripts/pi-ask --list

# probe model availability without sending context
scripts/pi-ask opus --probe

# send context by file
scripts/pi-ask opus -f /tmp/context.md

# send context by stdin
cat /tmp/context.md | scripts/pi-ask sonnet
```

Optional alias:

```bash
alias pi-ask="$PWD/scripts/pi-ask"
```

## Install as Oh My Pi Plugin

```bash
# from local checkout (for development)
omp plugin link /absolute/path/to/pi-ask

# from npm (after publish)
omp plugin install pi-ask
```

After install, the plugin exposes tool `pi_ask` with parameters:
- `model` (required unless `listModels=true`)
- `prompt` or `contextFile` (required unless `probe=true` or `listModels=true`)
- `probe` (optional boolean)
- `listModels` (optional boolean)

## Exit Codes (CLI)

- `0` success
- `1` model not found or ambiguous alias
- `2` model unavailable (probe failed)
- `4` context file not found
- `5` no stdin and no `-f` input

## Notes

- `pi-ask` does not enforce artificial timeouts. Let the model run until completion or interrupt with `Ctrl-C`.
- For Anthropic models, nested-session env vars are unset before invoking `claude` to allow use from agent environments.
- For non-Anthropic routes, `codex exec -m <model>` is used and noisy CLI wrappers are filtered from output.