// Monitora o status da portaria e envia notificação push (ntfy) para o iPhone
// quando o status muda para "entregando encomendas".
import { chromium } from "playwright";
import fs from "node:fs";

const URL = process.env.PORTAL_URL || "https://portalprimavera.online/";
const TOPIC = process.env.NTFY_TOPIC; // ex.: portaria-primavera-x7k29q (segredo no GitHub)
const STATE_FILE = "last_status.txt";
const ALVO = /entregando\s+encomenda/i;

if (!TOPIC) {
  console.error("Defina o segredo NTFY_TOPIC.");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
// Espera até 45s o status aparecer ("O porteiro está ...")
try {
  await page.waitForFunction(() => /porteiro est[aá]/i.test(document.body.innerText), null, { timeout: 45000 });
} catch {}
await page.waitForTimeout(2000);
const texto = (await page.innerText("body")).replace(/\s+/g, " ");
await browser.close();

const statusLido = (texto.match(/O porteiro est[aá] ([^.]+?)(?= Porteiro:|$)/i) || [])[1];
if (!statusLido) {
  console.log("Status não encontrado na página; mantendo o último status salvo.");
  console.log("Trecho da página:", texto.slice(0, 300));
  process.exit(0);
}
console.log("Status lido:", statusLido);

const entregando = ALVO.test(statusLido);
const atual = entregando ? "entregando" : "outro";
const anterior = fs.existsSync(STATE_FILE) ? fs.readFileSync(STATE_FILE, "utf8").trim() : "";

console.log(`Status: ${atual} (anterior: ${anterior || "nenhum"})`);
console.log("Trecho da página:", texto.slice(0, 300));

// Só notifica quando MUDA para "entregando" (evita notificação repetida)
if (entregando && anterior !== "entregando") {
  await fetch(`https://ntfy.sh/${TOPIC}`, {
    method: "POST",
    headers: {
      Title: "Portaria: entregando encomendas 📦",
      Priority: "high",
      Tags: "package",
      Click: URL,
    },
    body: "O porteiro está entregando encomendas agora.",
  });
  console.log("Notificação enviada.");
}

fs.writeFileSync(STATE_FILE, atual + "\n");
