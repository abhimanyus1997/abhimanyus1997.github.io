/**
 * /api/faces — server-side face descriptor storage (Vercel KV / Redis)
 *
 * GET  /api/faces          → { faces: { NAME: [[...128 floats], ...], ... } }
 * POST /api/faces          → { name, descriptors: [[...128 floats], ...] }  → saves & returns updated list
 * DELETE /api/faces?name=X → removes that name
 *
 * Abhimanyu's descriptor is seeded from env var FACE_ABHIMANYU (JSON array of 128 floats).
 * If the env var is absent the entry is skipped; the client falls back to reference image detection.
 *
 * Storage key: "faces" (one Redis hash, field = name.toUpperCase(), value = JSON array of arrays)
 */

import { kv } from "@vercel/kv";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // CORS preflight
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const stored = (await kv.get("faces")) || {};

      // Inject Abhimanyu from env if present and not already stored
      if (process.env.FACE_ABHIMANYU && !stored["ABHIMANYU"]) {
        try {
          stored["ABHIMANYU"] = [JSON.parse(process.env.FACE_ABHIMANYU)];
        } catch (_) {}
      }

      return res.status(200).json({ faces: stored });
    }

    if (req.method === "POST") {
      const { name, descriptors } = req.body || {};
      if (!name || !Array.isArray(descriptors) || !descriptors.length)
        return res.status(400).json({ error: "name and descriptors array required" });

      const key = String(name).toUpperCase().trim();
      const stored = (await kv.get("faces")) || {};
      // Merge new descriptors with any existing ones for the same name (up to 20 frames max)
      const existing = stored[key] || [];
      stored[key] = [...existing, ...descriptors].slice(-20);
      await kv.set("faces", stored);

      return res.status(200).json({ ok: true, name: key, count: stored[key].length });
    }

    if (req.method === "DELETE") {
      const name = (req.query.name || "").toUpperCase().trim();
      if (!name) return res.status(400).json({ error: "name query param required" });

      const stored = (await kv.get("faces")) || {};
      delete stored[name];
      await kv.set("faces", stored);

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[faces api]", err);
    return res.status(500).json({ error: err.message });
  }
}
