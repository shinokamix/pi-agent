# Display Modes

A Pi extension with three display modes:

- **Normal** shows Pi's full transcript.
- **Calm** shows assistant progress and subagent tools, but hides ordinary tool rows.
- **Zen** shows only the user's request and the final assistant response.

Pi's standard working indicator remains visible in every mode. Assistant lines are formatted through Pi's public transcript decorator, without patching private renderers. The separate `minimal-footer` extension shows the current mode alongside model and context information.

Use `/mode normal`, `/mode calm`, or `/mode zen`. Running `/mode` without a valid mode shows the current value.

The selected mode is stored in `~/.pi/agent/display-mode.json`. `PI_CODING_AGENT_DIR` overrides the parent directory.

The extension uses the transcript-presentation API from the pinned local Pi fork. Install it with:

```bash
./scripts/setup-pi-fork.sh
```

Run checks with `npm run check`.
