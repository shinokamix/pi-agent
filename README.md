# Pi agent

A portable [Pi](https://pi.dev) package that installs my extensions, agents, skills, and configuration as one unit. It uses supported Pi APIs and includes no credentials.

## Included

### Extensions

- [`pi-multi-account`](https://www.npmjs.com/package/pi-multi-account) — provides multi-account failover, rotation, and quota tracking
- [`@tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents) — runs user-defined subagents and workflows
- [`pi-web-access`](https://github.com/nicobailon/pi-web-access) — provides web search and public-page fetching

### Agents

- [`researcher`](./agents/researcher.md) — researches web and documentation sources
- [`scout`](./agents/scout.md) — maps codebases without modifying files
- [`worker`](./agents/worker.md) — implements focused changes and verifies them

### Configuration

- [`AGENTS.md`](./config/AGENTS.md) — defines global implementation discipline
- [`subagents.json`](./config/subagents.json) — enables only strict custom agents without fallback

### Skills

- [`clarity`](./skills/clarity) — writes and revises user-facing prose with an emphasis on accuracy, structure, and clarity
- [`unslop`](./skills/unslop) — removes formulaic AI phrasing from prose

## Install

Install Pi if needed:

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

Install the package:

```bash
pi install git:github.com/shinokamix/pi-agent
```

The package pins and loads `pi-multi-account`, `@tintinweb/pi-subagents`, and `pi-web-access` from its own dependencies. Define subagents globally in `~/.pi/agent/agents/` or per project in `.pi/agents/`. To expose only custom agents, set `disableDefaultAgents` to `true` and `fallbackSubagent` to `"none"` in `~/.pi/agent/subagents.json`.

Pi does not discover the included agents or global configuration directly from this package. From the package checkout, link them into Pi's global agent directory:

```bash
npm run link:config
```

The command honors `PI_CODING_AGENT_DIR` and refuses to replace existing files. Restart Pi or run `/reload` after linking.

Update later with:

```bash
pi update --extensions
```

## Local development

Clone the repository and install the checkout:

```bash
git clone https://github.com/shinokamix/pi-agent.git
cd pi-agent
npm install
pi install .
```

Run `npm run check` before publishing changes. Use `npm run lint:fix` and `npm run format` to apply automatic fixes. Lefthook runs both tools against staged files before each commit. Run `npm run link:config` after cloning the repository or moving its checkout. Run `/reload` after changing package resources.
