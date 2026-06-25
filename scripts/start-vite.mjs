import { createServer } from "vite";
import { appendFileSync } from "node:fs";

const log = (message) => {
  appendFileSync("vite-node.log", `${new Date().toISOString()} ${message}\n`);
};

process.on("uncaughtException", (error) => {
  log(`uncaughtException: ${error.stack || error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  log(`unhandledRejection: ${error?.stack || error}`);
  process.exit(1);
});

log("starting Vite server");

const server = await createServer({
  root: process.cwd(),
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true
  }
});

await server.listen();
server.printUrls();
log("Vite server listening on http://127.0.0.1:5173/");

await new Promise(() => {});
