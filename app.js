import { calcPnL, calcSummary, normalizeTrade } from "./calc.js";
import { exportTrades, importTrades, loadTrades, saveTrades } from "./storage.js";

const form = document.getElementById("trade-form");
const rows = document.getElementById("trade-rows");
const sumCount = document.getElementById("sum-count");
const sumPnl = document.getElementById("sum-pnl");
const sumWinRate = document.getElementById("sum-winrate");
const exportBtn = document.getElementById("export-json");
const importInput = document.getElementById("import-json");
const dateInput = document.getElementById("date");

let trades = loadTrades().map(normalizeTrade).filter(Boolean);

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function setInitialDate() {
  if (!dateInput.value) {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    dateInput.value = local;
  }
}

function createCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function render() {
  rows.textContent = "";

  for (const trade of trades) {
    const tr = document.createElement("tr");
    const pnl = calcPnL(trade);

    tr.appendChild(createCell(formatDate(trade.date)));
    tr.appendChild(createCell(trade.pair));
    tr.appendChild(createCell(trade.side === "buy" ? "Buy" : "Sell"));
    tr.appendChild(createCell(formatNumber(pnl)));
    tr.appendChild(createCell(trade.note || ""));

    const actionTd = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.dataset.id = trade.id;
    deleteBtn.textContent = "削除";
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    rows.appendChild(tr);
  }

  const summary = calcSummary(trades);
  sumCount.textContent = String(summary.count);
  sumPnl.textContent = formatNumber(summary.totalPnl);
  sumWinRate.textContent = `${formatNumber(summary.winRate)}%`;
}

function toPositiveNumber(value, fieldName) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error(`${fieldName}は0以上の数値で入力してください`);
  }
  return numericValue;
}

function buildTradeFromForm() {
  const data = new FormData(form);
  const pair = String(data.get("pair") || "").trim().toUpperCase();
  const date = String(data.get("date") || "");

  if (!pair) throw new Error("通貨ペアを入力してください");
  if (!date) throw new Error("日時を入力してください");

  const side = String(data.get("side") || "buy");
  if (side !== "buy" && side !== "sell") {
    throw new Error("売買はBuyまたはSellを選択してください");
  }

  return normalizeTrade({
    id: crypto.randomUUID(),
    date,
    pair,
    side,
    size: toPositiveNumber(data.get("size"), "ロット"),
    entry: toPositiveNumber(data.get("entry"), "エントリー"),
    exit: toPositiveNumber(data.get("exit"), "決済"),
    fee: toPositiveNumber(data.get("fee") || 0, "手数料"),
    swap: Number(data.get("swap") || 0),
    note: String(data.get("note") || "").trim(),
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const trade = buildTradeFromForm();
    trades.unshift(trade);
    saveTrades(trades);
    form.reset();
    setInitialDate();
    render();
  } catch (error) {
    alert(error instanceof Error ? error.message : "入力値を確認してください");
  }
});

rows.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const id = target.dataset.id;
  if (!id) return;

  trades = trades.filter((trade) => trade.id !== id);
  saveTrades(trades);
  render();
});

exportBtn.addEventListener("click", () => exportTrades(trades));

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  if (!file) return;
  try {
    const importedTrades = await importTrades(file);
    trades = importedTrades.map(normalizeTrade).filter(Boolean);
    saveTrades(trades);
    render();
  } catch (error) {
    alert(`インポートに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
  } finally {
    importInput.value = "";
  }
});

setInitialDate();
render();
