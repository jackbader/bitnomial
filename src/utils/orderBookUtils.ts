import { OrderBookData, OrderBookEntry } from "../types/orderBook";

interface AggregatedVolumeData {
  bidsTotalVolume: number;
  asksTotalVolume: number;
  userBidsTotalVolume: number;
  userAsksTotalVolume: number;
}

export function getAggregatedOrderBookByPrice(
  orderBookData: OrderBookData
): Map<number, AggregatedVolumeData> {
  const aggregatedMap = new Map<number, AggregatedVolumeData>();

  function updateAggregatedData(entry: OrderBookEntry, isBid: boolean) {
    const { price, size, isUserOrder } = entry;
    const currentData = aggregatedMap.get(price) || {
      bidsTotalVolume: 0,
      asksTotalVolume: 0,
      userBidsTotalVolume: 0,
      userAsksTotalVolume: 0,
    };

    if (isBid) {
      currentData.bidsTotalVolume += size;
      if (isUserOrder) {
        currentData.userBidsTotalVolume += size;
      }
    } else {
      currentData.asksTotalVolume += size;
      if (isUserOrder) {
        currentData.userAsksTotalVolume += size;
      }
    }

    aggregatedMap.set(price, currentData);
  }

  orderBookData.bids.forEach((bid) => updateAggregatedData(bid, true));
  orderBookData.asks.forEach((ask) => updateAggregatedData(ask, false));

  return aggregatedMap;
}

export function getOrderBookCenterPrice(
  lastTradedPrice: number,
  orderBookData: OrderBookData
): { centerPrice: number; highestBid: number; lowestAsk: number } {
  const combinedBidsAndAsks = [...orderBookData.bids, ...orderBookData.asks];

  if (combinedBidsAndAsks.length === 0) {
    return { centerPrice: lastTradedPrice, highestBid: 0, lowestAsk: 0 };
  }

  // find the highest bid price based on comparing all bid prices
  const highestBid = orderBookData.bids.reduce((max, entry) =>
    entry.price > max.price ? entry : max
  );

  console.log("highest bid", highestBid);

  // find the lowest ask price based on comparing all ask prices
  const lowestAsk = orderBookData.asks.reduce((min, entry) =>
    entry.price < min.price ? entry : min
  );

  // get the number between the highest bid and the lowest ask
  const centerPrice = Math.round((highestBid.price + lowestAsk.price) / 2);

  return {
    centerPrice,
    highestBid: highestBid.price,
    lowestAsk: lowestAsk.price,
  };
}

export function generatePriceRange(
  highestBid: number,
  lowestAsk: number,
  range: number
): number[] {
  const prices: number[] = [];

  // Generate prices above the lowest ask
  for (let i = lowestAsk; i < lowestAsk + range; i++) {
    prices.push(i);
  }

  // Generate prices below the highest bid
  for (let i = highestBid; i > highestBid - range; i--) {
    prices.push(i);
  }

  // Sort the prices in descending order
  return prices.sort((a, b) => b - a);
}
