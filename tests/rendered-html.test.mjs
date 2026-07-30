import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("redirige a /login cuando no hay sesión", async () => {
  const response = await render("/");
  assert.ok(
    [301, 302, 303, 307, 308].includes(response.status),
    `esperaba un redirect, recibió ${response.status}`,
  );
  assert.match(response.headers.get("location") ?? "", /\/login$/);
});

test("renderiza la pantalla de login", async () => {
  const response = await render("/login");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>OpsFlow \| Gestión inteligente de solicitudes<\/title>/i,
  );
  assert.match(html, /Iniciar sesión/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
