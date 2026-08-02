# Personal Pi setup

A version-controlled [Pi](https://pi.dev) setup with extensions, skills, prompts, themes, instructions, and portable settings. It excludes credentials, sessions, caches, and other machine-specific data.

## Included

- `display-modes`, `minimal-footer`, and `researcher` extensions
- [`writing-clearly-and-concisely`](https://github.com/obra/the-elements-of-style) skill
- Global instructions from [`AGENTS.md`](./AGENTS.md)
- Settings from [`config/settings.json`](./config/settings.json)

## Install

For the complete setup:

```bash
git clone https://github.com/shinokamix/pi-agent.git
cd pi-agent
./scripts/setup.sh
```

This installs the patched Pi build, repository resources, settings, and `npm:@narumitw/pi-usage`.

To install only the Pi package:

```bash
pi install git:github.com/shinokamix/pi-agent
```

From a local checkout:

```bash
pi install .
```

Run `/reload` after changing package resources.

## Patched Pi

Display Modes requires the transcript-presentation patch in [`forks/pi/transcript-presentation.patch`](./forks/pi/transcript-presentation.patch). Install it with:

```bash
./scripts/setup-pi-fork.sh
```

The script clones the Pi revision pinned in [`forks/pi/base.json`](./forks/pi/base.json), applies the patch, builds and tests Pi, then installs it globally. It recreates `~/.pi/build/pi-display-modes` on each run. Set `PI_FORK_DIR` to use another path ending in `/pi-display-modes`.

## Settings

Save settings changed through `/settings`:

```bash
./scripts/capture.sh
```

Apply tracked settings:

```bash
./scripts/apply.sh
```

Run both commands from the repository root.

## Update

For a Git installation:

```bash
pi update --extensions
```

For a local installation, pull the repository and run `./scripts/apply.sh`.

## Development

```bash
npm install
npm run check
```

After updating Pi, rebase the patch, run `./scripts/setup-pi-fork.sh` and `npm run check`, then test the TUI in a narrow terminal.
