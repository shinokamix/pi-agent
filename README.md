# Pi agent

A portable [Pi](https://pi.dev) package for my extensions, agents, skills, and global configuration.

## Included

### Extensions

- [`pi-multi-account`](https://www.npmjs.com/package/pi-multi-account) provides multi-account failover, rotation, and quota tracking.
- [`pi-subagents`](https://github.com/nicobailon/pi-subagents) runs user-defined foreground and background subagents and workflows.
- [`pi-web-access`](https://github.com/nicobailon/pi-web-access) provides web search and public-page fetching.

### Agents

- [`researcher`](./agents/researcher.md) researches web and documentation sources.
- [`scout`](./agents/scout.md) maps codebases without modifying files.
- [`worker`](./agents/worker.md) implements focused changes and verifies them.

### Configuration

- [`AGENTS.md`](./config/AGENTS.md) defines global instructions for Pi.
- The package exposes its custom agents directly to `pi-subagents`. Their definitions in [`agents`](./agents) are the source of truth.
- The link command disables built-in subagents in Pi settings, leaving the package's custom agents available by default.

### Skills

- [`subagent-workflow`](./skills/subagent-workflow) runs subagents in the current turn, isolates parallel writers, and cleans up their worktrees.
- [`technical-writing`](./skills/technical-writing) writes and reviews technical documentation using Diátaxis, Google developer style, Simplified Technical English, and Global English.

## Install

Install Pi if needed:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

Install the package:

```bash
pi install git:github.com/shinokamix/pi-agent
```

Pi loads the extensions, skills, and agents from the installed package. Global instructions still need a symbolic link.

The link command creates an `AGENTS.md` symbolic link under `${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}` and sets `subagents.disableBuiltins` to `true` in Pi's `settings.json`. It preserves unrelated settings and refuses to replace an existing file or unrelated symbolic link.

On macOS or Linux, run:

```bash
npm --prefix "${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}/git/github.com/shinokamix/pi-agent" run link:config
```

On Windows, run in PowerShell:

```powershell
$agentDir = if ($env:PI_CODING_AGENT_DIR) { $env:PI_CODING_AGENT_DIR } else { Join-Path $HOME ".pi/agent" }
npm --prefix (Join-Path $agentDir "git/github.com/shinokamix/pi-agent") run link:config
```

## Verify the installation

On macOS or Linux, inspect the link:

```bash
agent_dir="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
ls -l "$agent_dir/AGENTS.md"
```

On Windows, inspect the link in PowerShell:

```powershell
$agentDir = if ($env:PI_CODING_AGENT_DIR) { $env:PI_CODING_AGENT_DIR } else { Join-Path $HOME ".pi/agent" }
Get-Item (Join-Path $agentDir "AGENTS.md")
```

`AGENTS.md` must point into the installed package checkout. Restart Pi or run `/reload`, then run `/subagents-doctor` to check agent discovery.

## Update

Update the package and its included resources after changes land in the repository:

```bash
pi update --extensions
```

Run `/reload` to use the updated resources in the current session.
