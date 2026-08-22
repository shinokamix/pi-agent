# Pi agent

A portable [Pi](https://pi.dev) package that installs my extensions, skills, and prompts as one unit. It uses supported Pi APIs and includes no credentials or user settings.

## Included

### Extensions

- [`minimal-footer`](./extensions/minimal-footer) — shows the model, thinking level, context usage, and extension statuses
- [`researcher`](./extensions/researcher) — delegates web research to an isolated Pi process and returns only a cited brief
- [`pi-usage`](https://github.com/narumiruna/pi-extensions/tree/main/packages/pi-usage) — adds `/usage` and `/fast`

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
