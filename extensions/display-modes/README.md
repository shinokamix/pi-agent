# Display Modes

Controls how much of the Pi transcript appears:

- **Normal** shows all transcript blocks.
- **Calm** shows assistant messages and subagent tools.
- **Zen** shows the user's request and final response.

Change modes with:

```text
/mode normal
/mode calm
/mode zen
```

An invalid value reports the current mode. Pi stores the selection in `~/.pi/agent/display-mode.json`; `PI_CODING_AGENT_DIR` changes the parent directory.

The extension keeps Pi's working indicator and publishes the active mode through `ctx.ui.setStatus()`. It requires the local transcript-presentation patch:

```bash
./scripts/setup-pi-fork.sh
```
