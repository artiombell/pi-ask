# pi-ask

Cross-model consultation plugin for the Agency Playground.

Send context to **any model** supported by the `claude` or `codex` CLI for a second opinion, directly from your coding agent session.

## What it does

- **Dynamic model resolution** -- any model name works; short aliases for common models
- **Pre-flight probes** -- validates model availability (with auth error detection) before sending context
- **Full context pass-through** -- no truncation, no simplification
- **Auth recovery** -- automatic Anthropic OAuth token loading and interactive login fallback
- **Output filtering** -- strips Codex CLI noise from non-Anthropic responses

## Prerequisites

- `bash` 4+ (Git Bash on Windows)
- `claude` CLI (for Anthropic models)
- `codex` CLI (for OpenAI/GitHub Copilot/Google/xAI/Mistral routes)
- The [pi-ask](https://github.com/artiombell/pi-ask) repo cloned at `D:/dev/pi-ask`

## Skills

| Skill | Description |
|-------|-------------|
| `pi-ask` | Send context to another model for a second opinion |

## Usage

```
/skill:pi-ask opus "What's the best approach for implementing retry logic?"
```

Or from the `/pi-ask` command (if wired as a Pi command):

```
/pi-ask codex
```

## Model Resolution

Any model name accepted by the `claude` CLI or `codex` CLI works directly:

```
pi-ask opus                            # alias -> claude-opus-4-6
pi-ask claude-sonnet-4-6               # Anthropic, passed through
pi-ask gpt-5.3-codex                   # OpenAI via codex CLI
pi-ask github-copilot/gpt-5.3-codex   # GitHub Copilot via codex CLI
pi-ask gemini-3.1-pro                  # Gemini via codex CLI
pi-ask grok-4                          # Grok via codex CLI
```

Provider is inferred from the model name:
- `claude-*` -> `claude` CLI (Anthropic)
- Everything else -> `codex` CLI

Run `pi-ask --list` to see shortcut aliases.