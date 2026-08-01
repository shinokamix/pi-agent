# Personal Pi setup

A portable, version-controlled [Pi](https://pi.dev) setup with extensions, skills, prompts, themes, global instructions, and selected settings.

The repository excludes credentials, sessions, trust decisions, caches, and other machine-specific data.

## Included

- `calm-mode` and `pretty-response` extensions
- [`writing-clearly-and-concisely`](https://github.com/obra/the-elements-of-style) skill
- Global instructions from [`AGENTS.md`](./AGENTS.md)
- Portable settings from [`config/settings.json`](./config/settings.json)

## Install

### Pi package

Install extensions, skills, prompts, and themes:

```bash
pi install git:github.com/shinokamix/pi-agent
```

From a local checkout, install the current directory:

```bash
pi install .
```

Run `/reload` after changing package resources.

### Full setup

Clone the repository and run:

```bash
git clone https://github.com/shinokamix/pi-agent.git
cd pi-agent
./scripts/setup.sh
```

The script backs up and merges settings, links `AGENTS.md`, installs the local Pi package, and installs `npm:@narumitw/pi-usage`.

## Sync settings

Save portable changes made through `/settings`:

```bash
./scripts/capture.sh
git diff -- config/settings.json
```

Apply tracked settings after pulling changes:

```bash
./scripts/apply.sh
```

Run these commands from the repository root.

## Update

Update a Git-installed package:

```bash
pi update --extensions
```

For a local installation, pull the checkout and run `./scripts/apply.sh`.

## Development

```bash
npm install
npm run check
```

The UI extensions patch private Pi TUI components. After a Pi upgrade, run the checks and verify the interface in a narrow terminal.
