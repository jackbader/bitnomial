import { OrderBookData, OrderBookPriceMap } from "../../types/orderBook";

export function aggregateOrderBookEntries(
  orderBookData: OrderBookData
): OrderBookPriceMap {
  const aggregatedMap = new Map<
    number,
    {
      totalBidsSize: number;
      totalAsksSize: number;
      totalUserBids: number;
      totalUserAsks: number;
    }
  >();

  for (const entry of orderBookData.bids) {
    const existingEntry = aggregatedMap.get(entry.price) || {
      totalBidsSize: 0,
      totalAsksSize: 0,
      totalUserBids: 0,
      totalUserAsks: 0,
    };
    existingEntry.totalBidsSize += entry.size;
    existingEntry.totalUserBids += entry.isUserOrder ? entry.size : 0;
    aggregatedMap.set(entry.price, existingEntry);
  }

  for (const entry of orderBookData.asks) {
    const existingEntry = aggregatedMap.get(entry.price) || {
      totalBidsSize: 0,
      totalAsksSize: 0,
      totalUserBids: 0,
      totalUserAsks: 0,
    };
    existingEntry.totalAsksSize += entry.size;
    existingEntry.totalUserAsks += entry.isUserOrder ? entry.size : 0;
    aggregatedMap.set(entry.price, existingEntry);
  }

  return aggregatedMap;
}
