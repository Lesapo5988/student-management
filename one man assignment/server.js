const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5173);
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  let requestedPath;
  try {
    requestedPath = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
  } catch {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  const relativePath = path.relative(ROOT, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      response.writeHead(statError.code === "ENOENT" ? 404 : 500);
      response.end(statError.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const resolvedFile = stats.isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;

    fs.readFile(resolvedFile, (readError, content) => {
      if (readError) {
        response.writeHead(readError.code === "ENOENT" ? 404 : 500);
        response.end(readError.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }

      response.writeHead(200, {
        "Content-Type":
          MIME_TYPES[path.extname(resolvedFile).toLowerCase()] ||
          "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    });
  });
});

server.on("error", (error) => {
  console.error(`Unable to start Student Hub server: ${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Student Hub is running at http://127.0.0.1:${PORT}/`);
  console.log("Press Ctrl+C to stop the server.");
});
