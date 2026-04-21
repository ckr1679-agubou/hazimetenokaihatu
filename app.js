import { calcPnL, calcSummary } from "./calc.js";
import { exportTrades, importTrades, loadTrades, saveTrades } from "./storage.js";

const form = document.getElementById("trade-form");
const rows = document.getElementById("trade-rows");
const sumCount = document.getElementById("sum-count");
const sumPnl = document.getElementById("sum-pnl");
const sumWinRate = document.getElementById("sum-winrate");
const exportBtn = document.getElementById("export-json");
const importInput = document.getElementById("import-json");

let trades = loadTrades();

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 }).format(value);
}

function render() {
  rows.innerHTML = "";

  for (const trade of trades) {
    const tr = document.createElement("tr");
    const pnl = calcPnL(trade);
    tr.innerHTML = `
      <td>${trade.date}</td>
      <td>${trade.pair}</td>
      <td>${trade.side}</td>
      <td>${formatNumber(pnl)}</td>
      <td>${trade.note || ""}</td>
      <td><button data-id="${trade.id}" type="button">削除</button></td>
    `;
    rows.appendChild(tr);
  }

  const summary = calcSummary(trades);
  sumCount.textContent = String(summary.count);
  sumPnl.textContent = formatNumber(summary.totalPnl);
  sumWinRate.textContent = `${formatNumber(summary.winRate)}%`;
}

function buildTradeFromForm() {
  const data = new FormData(form);
  return {
    id: crypto.randomUUID(),
    date: data.get("date") || document.getElementById("date").value,
    pair: (data.get("pair") || document.getElementById("pair").value).trim().toUpperCase(),
    side: data.get("side") || document.getElementById("side").value,
    size: Number(data.get("size") || document.getElementById("size").value),
    entry: Number(data.get("entry") || document.getElementById("entry").value),
    exit: Number(data.get("exit") || document.getElementById("exit").value),
    fee: Number(data.get("fee") || document.getElementById("fee").value || 0),
    swap: Number(data.get("swap") || document.getElementById("swap").value || 0),
    note: data.get("note") || document.getElementById("note").value,
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const trade = buildTradeFromForm();
  trades.unshift(trade);
  saveTrades(trades);
  form.reset();
  render();
});

rows.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const id = target.dataset.id;
  trades = trades.filter((trade) => trade.id !== id);
  saveTrades(trades);
  render();
});

exportBtn.addEventListener("click", () => exportTrades(trades));

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  if (!file) return;
  try {
    trades = await importTrades(file);
    saveTrades(trades);
    render();
  } catch (error) {
    alert(`インポートに失敗しました: ${error.message}`);
  } finally {
    importInput.value = "";
  }
});

render();
