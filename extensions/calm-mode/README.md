# Calm Mode

Global Pi extension providing a Streaming Zen interface:

- streams visible assistant text while hiding thinking-only messages and tool rows;
- adds breathing room between each user message block and the model response;
- shows one stable `Thinking…` activity widget while the agent is working;
- replaces the footer with model, effort, context usage, and the current mode;
- supports `/calm on`, `/calm off`, and `/calm status`;
- restores Pi's normal transcript and footer when Calm Mode is disabled.

Run tests:

```bash
node --experimental-transform-types --test ~/.pi/agent/extensions/calm-mode/*.test.ts
```

The transcript integration patches private Pi TUI components because Pi does not yet expose a public transcript display policy. Re-run the tests after Pi upgrades.
