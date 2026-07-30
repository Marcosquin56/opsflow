const base = "http://localhost:9333";

async function newTarget(url) {
  const res = await fetch(`${base}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  return res.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.addEventListener("open", () => resolve(ws));
    ws.addEventListener("error", reject);
  });
}

function makeSender(ws, onEvent) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      onEvent?.(msg);
    }
  });
  return function send(method, params = {}) {
    const thisId = ++id;
    return new Promise((resolve) => {
      pending.set(thisId, resolve);
      ws.send(JSON.stringify({ id: thisId, method, params }));
    });
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const consoleMessages = [];
  const target = await newTarget("http://localhost:3000");
  const ws = await connect(target.webSocketDebuggerUrl);
  const send = makeSender(ws, (msg) => {
    if (msg.method === "Runtime.consoleAPICalled") {
      const args = msg.params.args.map((a) => a.value ?? a.description).join(" ");
      consoleMessages.push(`[${msg.params.type}] ${args}`);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await sleep(2500); // wait for hydration + initial fetch

  async function evalJs(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.result?.exceptionDetails) {
      return { __error: JSON.stringify(result.result.exceptionDetails) };
    }
    return result.result?.result?.value;
  }

  async function screenshot(name) {
    const result = await send("Page.captureScreenshot", { format: "png" });
    const fs = await import("node:fs/promises");
    await fs.writeFile(`.cdp-${name}.png`, Buffer.from(result.result.data, "base64"));
    console.log(`saved .cdp-${name}.png`);
  }

  await screenshot("backend-01-dashboard");

  // Go to Solicitudes view, open first request, change its status
  await evalJs(`
    [...document.querySelectorAll('.side-nav button')].find(b => b.textContent.includes('Solicitudes'))?.click();
  `);
  await sleep(500);
  await screenshot("backend-02-requests");

  await evalJs(`
    document.querySelector('.request-row, .table-row')?.click();
  `);
  await sleep(400);
  await screenshot("backend-03-drawer");

  const statusClickResult = await evalJs(`
    (() => {
      const btn = [...document.querySelectorAll('.status-section button')].find(b => !b.disabled);
      if (!btn) return 'NOT_FOUND';
      btn.click();
      return 'CLICKED ' + btn.textContent;
    })()
  `);
  console.log("status change click:", statusClickResult);
  await sleep(1200); // allow fetch round-trip + email attempt server-side
  await screenshot("backend-04-status-changed");

  // Go to Automatizaciones, toggle one
  await evalJs(`
    [...document.querySelectorAll('.side-nav button')].find(b => b.textContent.includes('Automatizaciones'))?.click();
  `);
  await sleep(500);
  const toggleResult = await evalJs(`
    (() => {
      const sw = document.querySelector('.switch');
      if (!sw) return 'NOT_FOUND';
      sw.click();
      return 'CLICKED';
    })()
  `);
  console.log("automation toggle:", toggleResult);
  await sleep(800);
  await screenshot("backend-05-automation-toggled");

  console.log("console messages:\n" + consoleMessages.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
