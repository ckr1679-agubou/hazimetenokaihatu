export function calcPnL(trade) {
  const direction = trade.side === "buy" ? 1 : -1;
  const gross = (trade.exit - trade.entry) * direction * trade.size * 10000;
  return gross - (trade.fee || 0) + (trade.swap || 0);
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
