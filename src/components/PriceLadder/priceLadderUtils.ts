import { OrderBookData } from "../../types/orderBook";

export function aggregateOrderBookEntries(orderBookData: OrderBookData) {
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

const generatePrices = (start: number, end: number, offset: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) =>
    Math.max(0, start + i + offset)
  );
};

const generateEmptyOrderBookPrices = (
  lastTradedPrice: number,
  additionalPricesOnEachSide: number
) => {
  return generatePrices(
    Math.max(0, lastTradedPrice - additionalPricesOnEachSide),
    lastTradedPrice + additionalPricesOnEachSide,
    0
  ).sort((a, b) => b - a);
};

const getDescendingOrderBookPrices = (orderBookData: OrderBookData) => {
  const combinedBidsAndAsks = [...orderBookData.bids, ...orderBookData.asks];
  const allOrderBookPrices = combinedBidsAndAsks.map((entry) => entry.price);
  const uniqueOrderBookPrices = [...new Set(allOrderBookPrices)];
  const descendingOrderBookPrices = uniqueOrderBookPrices.sort((a, b) => b - a);
  return descendingOrderBookPrices;
};

const getNonUserCenterPrice = (orderBookData: OrderBookData) => {
  const allNonUserBids = orderBookData.bids
    .filter((entry) => !entry.isUserOrder)
    .sort((a, b) => a.price - b.price);
  const allNonUserAsks = orderBookData.asks
    .filter((entry) => !entry.isUserOrder)
    .sort((a, b) => a.price - b.price);

  const lowestNonUserAskPrice = allNonUserAsks[0].price;
  const highestNonUserBidPrice =
    allNonUserBids[allNonUserBids.length - 1].price;

  const centerPrice = Math.round(
    (highestNonUserBidPrice + lowestNonUserAskPrice) / 2
  );

  // find the closest price in the order book to the center price that is an ask
  const closestPrice = orderBookData.asks.reduce((minPrice, ask) => {
    const minPriceDifference = Math.abs(minPrice - centerPrice);
    const priceDifference = Math.abs(ask.price - centerPrice);
    return priceDifference < minPriceDifference ? ask.price : minPrice;
  }, orderBookData.asks[0].price);

  return closestPrice;
};

// Get all possible prices within a 1,000+/i range of order book prices
const generateDetailedListOfPrices = (orderBookData: OrderBookData) => {
  const combinedBidsAndAsks = [
    ...orderBookData.bids,
    ...orderBookData.asks,
  ].sort((a, b) => a.price - b.price);

  const lowestPrice = combinedBidsAndAsks[0].price;
  const highestPrice =
    combinedBidsAndAsks[combinedBidsAndAsks.length - 1].price;
  const allPrices = generatePrices(
    Math.max(0, lowestPrice),
    highestPrice,
    0
  ).sort((a, b) => b - a);

  return allPrices;
};

export const getPricesForOrderBook = (orderBookData: OrderBookData | null) => {
  if (!orderBookData)
    return { allPrices: [], orderBookPrices: [], centerPrice: 0 };

  const additionalPricesOnEachSide = 1000;

  if (orderBookData.bids.length === 0 || orderBookData.asks.length === 0) {
    const { lastTradedPrice } = orderBookData;
    const allPrices = generateEmptyOrderBookPrices(
      lastTradedPrice,
      additionalPricesOnEachSide
    );
    return { allPrices, orderBookPrices: [], centerPrice: lastTradedPrice };
  }

  // Get all possible prices within a 1,000+/i range of order book prices
  const allPrices = generateDetailedListOfPrices(orderBookData);

  // Get list of prices from the order book in descending order
  const orderBookPrices = getDescendingOrderBookPrices(orderBookData);

  // Get the center price based on the non-user bids and asks
  const centerPrice = getNonUserCenterPrice(orderBookData);

  return { allPrices, orderBookPrices, centerPrice };
};
