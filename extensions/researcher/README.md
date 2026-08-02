# Researcher

Delegates web research to a temporary Pi process. The parent conversation receives only the final cited brief, not fetched pages or intermediate turns.

The child can search the web, fetch public pages, and submit its brief. Each run allows up to eight searches and twelve fetched pages. At most three researchers may run at once. Local and private-network URLs are blocked.

The default model is `openai-codex/gpt-5.4-mini:low`. Set `PI_RESEARCHER_MODEL` to change it. Search uses Brave when `BRAVE_SEARCH_API_KEY` is set and DuckDuckGo otherwise.
