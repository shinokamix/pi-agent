# Pi agent

A portable [Pi](https://pi.dev) package that installs my extensions, skills, and prompts as one unit. It uses supported Pi APIs and includes no credentials or user settings.

## Included

### Extensions

- `minimal-footer` — shows the model, thinking level, and context usage
- `researcher` — delegates web research to an isolated Pi process
- [`pi-usage`](https://github.com/narumiruna/pi-extensions/tree/main/packages/pi-usage) — adds `/usage` and `/fast`

### Skills

- `writing-clearly-and-concisely` — improves user-facing prose

### Prompts

- `code-review` — reviews a selected set of changes
- `commit-message` — writes a commit message from staged changes

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
