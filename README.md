# mcp-vizier

CDS VizieR — astronomical catalogue server (tens of thousands of catalogues)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `catalogs` | Search VizieR catalogue metadata. |
| `query_catalog` | Query rows of a single catalogue (e.g. "I/345/gaia2"). |
| `cone_search` | Cone search around (RA, Dec). |
| `object` | Query by object name (resolved via SIMBAD/NED). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "vizier": {
      "url": "https://gateway.pipeworx.io/vizier/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Vizier data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
