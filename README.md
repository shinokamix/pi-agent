# Pi agent

A portable [Pi](https://pi.dev) package for my extensions, agents, skills, and global configuration. It uses supported Pi APIs and includes no credentials.

## Included

### Extensions

- [`pi-multi-account`](https://www.npmjs.com/package/pi-multi-account) provides multi-account failover, rotation, and quota tracking.
- [`@tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents) runs user-defined subagents and workflows.
- [`pi-web-access`](https://github.com/nicobailon/pi-web-access) provides web search and public-page fetching.

### Agents

- [`researcher`](./agents/researcher.md) researches web and documentation sources.
- [`scout`](./agents/scout.md) maps codebases without modifying files.
- [`worker`](./agents/worker.md) implements focused changes and verifies them.

### Configuration

- [`AGENTS.md`](./config/AGENTS.md) defines global instructions for Pi.
- [`subagents.json`](./config/subagents.json) enables only strict custom agents without fallback.

### Skills

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

Pi loads the extensions and skills from the package. Pi packages do not discover agents or global configuration, so link those files separately.

The link command creates these symbolic links under `${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}`:

- `agents/researcher.md`
- `agents/scout.md`
- `agents/worker.md`
- `AGENTS.md`
- `subagents.json`

The command never replaces regular files. It updates existing symbolic links to point to this package. If the listed paths contain symbolic links that you want to keep, check them before you run the command.

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

On macOS or Linux, inspect the links:

```bash
agent_dir="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
ls -l "$agent_dir/AGENTS.md" "$agent_dir/subagents.json" "$agent_dir/agents/"{researcher,scout,worker}.md
```

On Windows, inspect them in PowerShell:

```powershell
$agentDir = if ($env:PI_CODING_AGENT_DIR) { $env:PI_CODING_AGENT_DIR } else { Join-Path $HOME ".pi/agent" }
Get-Item (Join-Path $agentDir "AGENTS.md"), (Join-Path $agentDir "subagents.json"), (Join-Path $agentDir "agents/researcher.md"), (Join-Path $agentDir "agents/scout.md"), (Join-Path $agentDir "agents/worker.md")
```

Each path must be a symbolic link into the package checkout. Restart Pi or run `/reload` to load the linked resources.

## Update

Update the package and its included resources after changes land in the repository:

```bash
pi update --extensions
```

Run `/reload` to use the updated resources in the current session.
