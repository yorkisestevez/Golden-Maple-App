import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS presets (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text UNIQUE NOT NULL,
      config jsonb NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `;
};

export async function handler(event) {
  try {
    await ensureTable();

    if (event.httpMethod === 'GET') {
      const presets = await sql`
        SELECT id, name, config, created_at, updated_at
        FROM presets
        ORDER BY updated_at DESC
      `;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presets }),
      };
    }

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid JSON body' }),
        };
      }

      const name = body?.name;
      const config = body?.config;

      if (!name || typeof name !== 'string') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Preset name is required' }),
        };
      }

      if (config === undefined) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Preset config is required' }),
        };
      }

      await sql`
        INSERT INTO presets (name, config)
        VALUES (${name}, ${config})
        ON CONFLICT (name)
        DO UPDATE SET config = EXCLUDED.config, updated_at = now()
      `;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
