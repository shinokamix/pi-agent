# Researcher

`researcher` delegates web research to an ephemeral Pi process so fetched pages and intermediate turns never enter the parent conversation. The parent receives only the final cited brief.

## Behavior

- Uses `openai-codex/gpt-5.4-mini:low` by default.
- Exposes only `web_search`, `web_fetch`, and the terminating `submit_research` tool to the child.
- Allows at most three concurrent researchers.
- Limits each run to eight searches and twelve fetched pages.
- Blocks local and private-network URLs and caps fetched content.
- Reports child-model usage to Pi.
- Shows compact live progress in normal and Calm Mode; expand the tool result for the full brief.

Set `PI_RESEARCHER_MODEL` to choose another child model. If `BRAVE_SEARCH_API_KEY` is set, search uses the Brave Search API; otherwise it falls back to DuckDuckGo HTML search.

## Design references

- [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OpenAI Agents SDK: Multi-agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/)
- [LangChain Open Deep Research](https://github.com/langchain-ai/open_deep_research)
- [Pi subagent example](https://github.com/earendil-works/pi-mono/tree/main/packages/coding-agent/examples/extensions/subagent)
