import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const ASSETS = path.join(DIST, "assets");
const INDEX = path.join(DIST, "index.html");

const API_ORIGIN = process.env.API_ORIGIN;
if (!API_ORIGIN) {
  console.error("API_ORIGIN 환경변수가 없습니다.");
  process.exit(1);
}

const app = express();

// 1. /api → 백엔드
app.use(
  createProxyMiddleware({
    pathFilter: "/api",
    target: API_ORIGIN,
    changeOrigin: true,
    xfwd: true,
  }),
);

// 2. dist 정적 파일
app.use(
  express.static(DIST, {
    index: false,
    setHeaders(res, filePath) {
      res.setHeader(
        "Cache-Control",
        filePath.startsWith(ASSETS)
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      );
    },
  }),
);

// 3. SPA fallback
app.use((req, res) => {
  if (req.method !== "GET") {
    res.status(404).json({ message: "Not Found" });
    return;
  }
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(INDEX);
});

const port = process.env.PORT ?? 8080;
app.listen(port, () => {
  console.log(`specnote-front :${port} → ${API_ORIGIN}`);
});
