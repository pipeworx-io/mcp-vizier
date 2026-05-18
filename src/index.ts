interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * VizieR MCP — CDS astronomical catalogue access.
 *
 * Auth: none. Docs: https://vizier.cds.unistra.fr/doc/asu-summary.htx
 */


const BASE = 'https://vizier.cds.unistra.fr';
const UA = 'pipeworx-mcp-vizier/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'catalogs',
    description: 'Search VizieR catalogue metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords (e.g. "Gaia DR3", "exoplanet").' },
        max: { type: 'number', description: '1-200 (default 25)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'query_catalog',
    description: 'Query rows of a single catalogue (e.g. "I/345/gaia2").',
    inputSchema: {
      type: 'object',
      properties: {
        catalog: { type: 'string' },
        constraint: { type: 'string', description: 'Solr-style constraints, e.g. "Plx>20"' },
        columns: { type: 'string', description: 'Comma-sep columns to return.' },
        max: { type: 'number', description: '1-50000 (default 50).' },
      },
      required: ['catalog'],
    },
  },
  {
    name: 'cone_search',
    description: 'Cone search around (RA, Dec).',
    inputSchema: {
      type: 'object',
      properties: {
        catalog: { type: 'string' },
        ra: { type: 'number', description: 'RA in decimal degrees.' },
        dec: { type: 'number', description: 'Dec in decimal degrees.' },
        radius_deg: { type: 'number' },
        max: { type: 'number' },
      },
      required: ['catalog', 'ra', 'dec', 'radius_deg'],
    },
  },
  {
    name: 'object',
    description: 'Query by object name (resolved via SIMBAD/NED).',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        catalog: { type: 'string', description: 'Optional catalogue id; default queries all.' },
      },
      required: ['name'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'catalogs': {
      const params = new URLSearchParams({
        '-source': '',
        '-words': reqStr(args, 'query', '"Gaia"'),
        '-out.form': 'json',
        '-out.max': String(Math.min(200, Math.max(1, (args.max as number) ?? 25))),
      });
      return vGet(`/viz-bin/votable?${params}`, 'json');
    }
    case 'query_catalog': {
      const params = buildBase(args, 50, 50000);
      if (args.constraint) params.set('-c', String(args.constraint));
      if (args.columns) params.set('-out', String(args.columns));
      return vGet(`/viz-bin/votable?${params}`, 'json');
    }
    case 'cone_search': {
      const params = buildBase(args, 50, 50000);
      const ra = args.ra as number;
      const dec = args.dec as number;
      const r = args.radius_deg as number;
      if (typeof ra !== 'number' || typeof dec !== 'number' || typeof r !== 'number') {
        throw new Error('cone_search requires ra, dec, radius_deg as numbers.');
      }
      params.set('-c', `${ra} ${dec >= 0 ? '+' : ''}${dec}`);
      params.set('-c.rd', String(r));
      return vGet(`/viz-bin/votable?${params}`, 'json');
    }
    case 'object': {
      const params = buildBase(args, 25, 25);
      params.set('-c', reqStr(args, 'name', '"M31"'));
      return vGet(`/viz-bin/votable?${params}`, 'json');
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function buildBase(args: Record<string, unknown>, defaultMax: number, maxMax: number): URLSearchParams {
  const cat = reqStr(args, 'catalog', '"I/345/gaia2"');
  const p = new URLSearchParams({
    '-source': cat,
    '-out.form': 'json',
    '-out.max': String(Math.min(maxMax, Math.max(1, (args.max as number) ?? defaultMax))),
  });
  return p;
}

async function vGet(path: string, expect: 'json'): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`VizieR: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  const text = await res.text();
  // VizieR's "json" endpoint sometimes returns plain text on errors; try JSON parse.
  try { return JSON.parse(text); } catch { return { format: 'raw', body: text.slice(0, 4000) }; }
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
