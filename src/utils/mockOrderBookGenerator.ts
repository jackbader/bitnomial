import { OrderBookData, OrderBookEntry } from "../types/orderBook";

export function generateMockOrderBookData(
  ticker: string,
  length: number = 2000
): OrderBookData {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  for (let i = 0; i < length; i++) {
    const price =
      i < length / 2 ? 50000 - i * 10 : 50010 + (i - length / 2) * 10;
    const size = Math.floor(Math.random() * 100) + 1;

    if (i < length / 2) {
      bids.push({ price, size, isUserOrder: false });
    } else {
      asks.push({ price, size, isUserOrder: false });
    }
  }

  // Sort bids in descending order and asks in ascending order
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  const orderBookData = { bids, asks };

  return orderBookData;
}
