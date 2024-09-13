import { OrderBookData, OrderBookEntry } from "../../types/orderBook";

interface AggregatedEntry {
  totalBidsSize: number;
  totalAsksSize: number;
  totalUserBidsSize: number;
  totalUserAsksSize: number;
}

export function aggregateOrderBookEntries(
  orderBookData: OrderBookData
): Map<number, AggregatedEntry> {
  const aggregatedEntries = new Map<number, AggregatedEntry>();

  if (!orderBookData) return aggregatedEntries;

  const { bids, asks } = orderBookData;

  const aggregateEntries = (entries: OrderBookEntry[], isBid: boolean) => {
    entries.forEach((entry) => {
      const existingEntry = aggregatedEntries.get(entry.price);

      if (existingEntry) {
        if (isBid) {
          existingEntry.totalBidsSize += entry.size;
          existingEntry.totalUserBidsSize += entry.isUserOrder ? entry.size : 0;
        } else {
          existingEntry.totalAsksSize += entry.size;
          existingEntry.totalUserAsksSize += entry.isUserOrder ? entry.size : 0;
        }
      } else {
        aggregatedEntries.set(entry.price, {
          totalBidsSize: isBid ? entry.size : 0,
          totalAsksSize: isBid ? 0 : entry.size,
          totalUserBidsSize: isBid && entry.isUserOrder ? entry.size : 0,
          totalUserAsksSize: !isBid && entry.isUserOrder ? entry.size : 0,
        });
      }
    });
  };

  aggregateEntries(bids, true);
  aggregateEntries(asks, false);

  return aggregatedEntries;
}

export const getPricesForOrderBook = (
  orderBookPriceMap: Map<number, AggregatedEntry>
) => {
  // if there are no order book prices
  if (orderBookPriceMap.size === 0) {
    return { allPrices: [], orderBookPrices: [] };
  }

  // find the range of prices in orderBookPriceMap
  const orderBookPrices = Array.from(orderBookPriceMap.keys()).sort(
    (a, b) => b - a
  );
  const highestBid = orderBookPrices[0];
  const lowestAsk = orderBookPrices[orderBookPrices.length - 1];
  const priceRange = highestBid - lowestAsk;
  const allPrices = Array.from(
    { length: priceRange + 1 },
    (_, i) => lowestAsk + i
  ).sort((a, b) => b - a);

  return { allPrices, orderBookPrices };
};
