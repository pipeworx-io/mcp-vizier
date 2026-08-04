# @pipeworx/vizier

[VizieR](https://vizier.cds.unistra.fr) MCP — CDS Strasbourg astronomical catalogue server. Tens of thousands of catalogues covering stars, galaxies, exoplanets, surveys. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `catalogs(query, max?)` — search VizieR catalogue metadata
- `query_catalog(catalog, constraint?, columns?, max?)` — query rows of one catalogue
- `cone_search(catalog, ra, dec, radius_deg, max?)` — cone search around (RA, Dec)
- `object(name, catalog?)` — query by object name

## Data source

`https://vizier.cds.unistra.fr/viz-bin/` and `https://vizier.cds.unistra.fr/vizier/`

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
