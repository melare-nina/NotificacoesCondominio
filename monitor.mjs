// Monitora o status da portaria e envia notificação push (ntfy) para o iPhone
// quando o status muda para "entregando encomendas".
import { chromium } from "playwright";
import fs from "node:fs";

const URL = process.env.PORTAL_URL || "https://portalprimavera.online/publico";
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
await page.waitForTimeout(5000); // dá tempo do site carregar o status
const texto = (await page.innerText("body")).replace(/\s+/g, " ");
await browser.close();

const entregando = ALVO.test(texto);
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
