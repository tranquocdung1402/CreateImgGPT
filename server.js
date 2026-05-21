import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const JSON_LIMIT_BYTES = 18 * 1024 * 1024;

await loadLocalEnv();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (req.method === "POST" && url.pathname === "/api/generate-image") {
      await handleGenerateImage(req, res);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    await serveStatic(url.pathname, res, req.method === "HEAD");
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`CreateImgGPT running at http://localhost:${PORT}`);
});

async function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (!existsSync(envPath)) return;

  const content = await readFile(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function serveStatic(pathname, res, headOnly = false) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, "public", safePath);

  if (!filePath.startsWith(path.join(__dirname, "public"))) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(headOnly ? undefined : file);
  } catch {
    sendText(res, 404, "Not found");
  }
}

async function handleGenerateImage(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_new_openai_api_key_here") {
    sendJson(res, 400, {
      error: "OPENAI_API_KEY is missing. Put your key in .env.local and restart the server."
    });
    return;
  }

  const payload = await readJsonBody(req);
  const prompt = String(payload.prompt || "").trim();
  if (!prompt) {
    sendJson(res, 400, { error: "Prompt is required." });
    return;
  }

  const content = [{ type: "input_text", text: prompt }];
  if (payload.logoDataUrl) {
    content.push({ type: "input_image", image_url: payload.logoDataUrl });
  }

  const requestBody = {
    model: payload.model || "gpt-5.5",
    input: [{ role: "user", content }],
    tools: [
      {
        type: "image_generation",
        model: payload.imageModel || "gpt-image-2",
        size: payload.size || "1024x1792",
        quality: payload.quality || "high"
      }
    ]
  };

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const result = await openaiResponse.json().catch(() => null);
  if (!openaiResponse.ok) {
    sendJson(res, openaiResponse.status, {
      error: result?.error?.message || "OpenAI image generation failed.",
      details: result?.error || result
    });
    return;
  }

  const imageBase64 = findImageBase64(result);
  if (!imageBase64) {
    sendJson(res, 502, {
      error: "OpenAI response did not include an image payload.",
      details: result
    });
    return;
  }

  sendJson(res, 200, {
    imageDataUrl: `data:image/png;base64,${imageBase64}`,
    responseId: result.id || null
  });
}

function findImageBase64(value) {
  if (!value || typeof value !== "object") return null;

  if (typeof value.result === "string" && looksLikeBase64(value.result)) return value.result;
  if (typeof value.b64_json === "string" && looksLikeBase64(value.b64_json)) return value.b64_json;
  if (typeof value.image_base64 === "string" && looksLikeBase64(value.image_base64)) {
    return value.image_base64;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageBase64(item);
      if (found) return found;
    }
    return null;
  }

  for (const item of Object.values(value)) {
    const found = findImageBase64(item);
    if (found) return found;
  }

  return null;
}

function looksLikeBase64(value) {
  return value.length > 1000 && /^[A-Za-z0-9+/=\s]+$/.test(value);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > JSON_LIMIT_BYTES) {
        req.destroy();
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}
