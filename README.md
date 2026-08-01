# pi-agent

Personal setup for [Pi](https://pi.dev), distributed as a native Pi package.

## Included

- `calm-mode` — Streaming Zen transcript, activity indicator, and compact footer.
- `pretty-response` — compact assistant Markdown rendering.
- Portable personal settings for model, reasoning level, and UI.
- Global personal instructions in [`AGENTS.md`](./AGENTS.md).

Credentials, trust decisions, sessions, caches, and crash logs are never stored here.

## Regular installation

Install only the Pi package resources (extensions, skills, prompts, and themes):

```bash
pi install git:github.com/shinokamix/pi-agent
```

This does not replace global instructions or personal settings and does not install companion packages.

For development from a local checkout:

```bash
pi install ~/Documents/projects/pi-agent
```

Pi loads resources directly from the checkout. After editing an extension, run `/reload`.

## Full personal installation

Clone the repository and run the setup script:

```bash
git clone https://github.com/shinokamix/pi-agent.git \
  ~/Documents/projects/pi-agent
cd ~/Documents/projects/pi-agent
./scripts/setup.sh
```

The setup script:

1. backs up and merges portable settings into `~/.pi/agent/settings.json`;
2. links the repository's `AGENTS.md` as the global Pi context file;
3. backs up legacy copies of `calm-mode` and `pretty-response` to avoid loading duplicates;
4. installs this checkout as a local Pi package;
5. installs `npm:@narumitw/pi-usage` separately.

It never copies or modifies `auth.json`, sessions, or trust decisions.

## Settings workflow

Capture portable settings changed through `/settings`:

```bash
./scripts/capture.sh
git diff -- config/settings.json
```

Apply tracked settings after pulling changes on another machine:

```bash
git pull
./scripts/apply.sh
```

Runtime-owned and machine-specific fields such as `lastChangelogVersion`, package paths, session directories, proxies, and shell prefixes are not captured.

## Development

```bash
npm install
npm run check
```

Typical workflow:

```bash
# Edit files in extensions/
/reload
npm run check
git add .
git commit
```

Both UI extensions patch private Pi TUI components. Run the checks after every Pi upgrade and verify rendering interactively, especially in a narrow terminal.

## Updating

A regular Git package installation is updated by Pi:

```bash
pi update --extensions
```

A full personal/local installation is updated from its working checkout:

```bash
cd ~/Documents/projects/pi-agent
git pull
./scripts/apply.sh
```
