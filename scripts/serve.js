const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, "..", "_site");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".txt":  "text/plain",
  ".xml":  "application/xml",
  ".yml":  "text/yaml",
  ".map":  "application/json",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
};

function serve(req, res) {
  let urlPath = req.url.split("?")[0];
  let filePath = path.join(ROOT, urlPath);

  // Directory → index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  // No extension → try /index.html
  if (!path.extname(filePath)) {
    const candidate = path.join(filePath, "index.html");
    if (fs.existsSync(candidate)) filePath = candidate;
    else filePath += ".html";
  }

  if (!fs.existsSync(filePath)) {
    const notFound = path.join(ROOT, "404.html");
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(fs.readFileSync(notFound));
    } else {
      res.writeHead(404);
      res.end("404 Not Found");
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const ct = MIME[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": ct });
  fs.createReadStream(filePath).pipe(res);
}

http.createServer(serve).listen(PORT, () => {
  console.log(`\n🟡 Pichardo's Photography`);
  console.log(`📸 http://localhost:${PORT}\n`);
});
