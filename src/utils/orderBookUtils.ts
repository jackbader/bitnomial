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
  const startTime = performance.now();

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

  const endTime = performance.now();
  const executionTimeInSeconds = (endTime - startTime) / 1000;
  console.log(
    `aggregateOrderBookVolumes execution time: ${executionTimeInSeconds.toFixed(
      6
    )} seconds`
  );

  return aggregatedMap;
}

export function getOrderBookCenterPrice(
  lastTradedPrice: number,
  orderBookData: OrderBookData
): number {
  const combinedBidsAndAsks = [...orderBookData.bids, ...orderBookData.asks];

  if (combinedBidsAndAsks.length === 0) {
    return lastTradedPrice;
  }

  // find the highest bid price based on comparing all bid prices
  const highestBid = combinedBidsAndAsks.reduce((max, entry) =>
    entry.price > max.price ? entry : max
  );

  // find the lowest ask price based on comparing all ask prices
  const lowestAsk = combinedBidsAndAsks.reduce((min, entry) =>
    entry.price < min.price ? entry : min
  );

  // get the number between the highest bid and the lowest ask
  const centerPrice = Math.round((highestBid.price + lowestAsk.price) / 2);

  return centerPrice;
}

export function generatePriceRange(
  centerPrice: number,
  range: number
): number[] {
  const prices: number[] = [];
  for (let i = centerPrice + range; i >= centerPrice - range; i--) {
    prices.push(i);
  }
  return prices;
}
