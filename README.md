# Pi agent

A portable [Pi](https://pi.dev) package that installs my extensions, skills, and prompts as one unit. It uses supported Pi APIs and includes no credentials or user settings.

## Included

### Extensions

- [`pi-multi-account`](https://www.npmjs.com/package/pi-multi-account) — provides multi-account failover, rotation, and quota tracking
- [`@tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents) — runs user-defined subagents and workflows
- [`pi-web-access`](https://github.com/nicobailon/pi-web-access) — provides web search and public-page fetching

### Skills

- [`clarity`](./skills/clarity) — writes and revises user-facing prose with an emphasis on accuracy, structure, and clarity

### Prompts

- [`code-review`](./prompts/code-review.md) — reviews requested changes for defects and unnecessary complexity
- [`commit-message`](./prompts/commit-message.md) — suggests three commit messages from staged or unstaged changes

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

Restart Pi or run `/reload`.

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

Run `npm run check` before publishing changes. Use `npm run lint:fix` and `npm run format` to apply automatic fixes. Lefthook runs both tools against staged files before each commit. Run `/reload` after changing package resources.
