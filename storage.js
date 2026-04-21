const STORAGE_KEY = "fx_trades_v1";

export function loadTrades() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

export function exportTrades(trades) {
  const blob = new Blob([JSON.stringify(trades, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fx-trades-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function sortByDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export async function importTrades(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON配列形式ではありません");
  }

  return parsed.sort(sortByDateDesc);
}
