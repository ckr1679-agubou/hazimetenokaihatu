export function normalizeTrade(input) {
  if (!input || typeof input !== "object") return null;

  const side = input.side === "sell" ? "sell" : "buy";
  const size = Number(input.size);
  const entry = Number(input.entry);
  const exit = Number(input.exit);
  const fee = Number(input.fee ?? 0);
  const swap = Number(input.swap ?? 0);

  if (![size, entry, exit, fee, swap].every(Number.isFinite)) {
    return null;
  }

  return {
    id: String(input.id || crypto.randomUUID()),
    date: String(input.date || ""),
    pair: String(input.pair || "").trim().toUpperCase(),
    side,
    size,
    entry,
    exit,
    fee,
    swap,
    note: String(input.note || "").trim(),
  };
}

export function calcPnL(trade) {
  const direction = trade.side === "buy" ? 1 : -1;
  const gross = (trade.exit - trade.entry) * direction * trade.size * 10000;
  return gross - trade.fee + trade.swap;
}

export function calcSummary(trades) {
  const count = trades.length;
  let wins = 0;
  let totalPnl = 0;

  for (const trade of trades) {
    const pnl = calcPnL(trade);
    totalPnl += pnl;
    if (pnl > 0) wins += 1;
  }

  const winRate = count === 0 ? 0 : (wins / count) * 100;

  return {
    count,
    totalPnl,
    winRate,
  };
}
