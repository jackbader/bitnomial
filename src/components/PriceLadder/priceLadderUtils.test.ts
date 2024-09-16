import {
  aggregateOrderBookEntries,
  getPricesForOrderBook,
} from "./priceLadderUtils";
import { OrderBookData } from "../../types/orderBook";

describe("priceLadderUtils", () => {
  describe("aggregateOrderBookEntries", () => {
    it("should aggregate order book entries correctly", () => {
      const orderBookData: OrderBookData = {
        bids: [
          { price: 100, size: 10, isUserOrder: false },
          { price: 100, size: 5, isUserOrder: true },
          { price: 99, size: 15, isUserOrder: false },
        ],
        asks: [
          { price: 101, size: 8, isUserOrder: false },
          { price: 101, size: 2, isUserOrder: true },
          { price: 102, size: 12, isUserOrder: false },
        ],
        lastTradedPrice: 100,
      };

      const result = aggregateOrderBookEntries(orderBookData);

      expect(result.get(100)).toEqual({
        totalBidsSize: 15,
        totalAsksSize: 0,
        totalUserBidsSize: 5,
        totalUserAsksSize: 0,
      });
      expect(result.get(99)).toEqual({
        totalBidsSize: 15,
        totalAsksSize: 0,
        totalUserBidsSize: 0,
        totalUserAsksSize: 0,
      });
      expect(result.get(101)).toEqual({
        totalBidsSize: 0,
        totalAsksSize: 10,
        totalUserBidsSize: 0,
        totalUserAsksSize: 2,
      });
      expect(result.get(102)).toEqual({
        totalBidsSize: 0,
        totalAsksSize: 12,
        totalUserBidsSize: 0,
        totalUserAsksSize: 0,
      });
    });

    it("should return an empty map for null order book data", () => {
      const result = aggregateOrderBookEntries(null);
      expect(result.size).toBe(0);
    });
  });

  describe("getPricesForOrderBook", () => {
    it("should return correct prices when order book has entries", () => {
      const orderBookData: OrderBookData = {
        bids: [
          { price: 98, size: 10, isUserOrder: false },
          { price: 99, size: 15, isUserOrder: false },
        ],
        asks: [
          { price: 101, size: 8, isUserOrder: false },
          { price: 102, size: 12, isUserOrder: false },
        ],
        lastTradedPrice: 100,
      };

      const { allPrices, orderBookPrices, centerPrice } =
        getPricesForOrderBook(orderBookData);

      expect(allPrices.length).toBe(1103); // [0 -> 1102], length is 1103 including 0
      expect(allPrices[0]).toBe(1102); // Highest price (102 + 1000)
      expect(allPrices[allPrices.length - 1]).toBe(0); // Lowest price (max of 0 and 98 - 1000)
      expect(orderBookPrices).toEqual([102, 101, 99, 98]);
      expect(centerPrice).toBe(100);
    });

    it("should handle empty bids or asks", () => {
      const orderBookData: OrderBookData = {
        bids: [],
        asks: [],
        lastTradedPrice: 100,
      };

      const { allPrices, orderBookPrices } =
        getPricesForOrderBook(orderBookData);

      expect(allPrices.length).toBe(1101); // [0 -> 1100], length is 1101 including 0
      expect(allPrices[0]).toBe(1100);
      expect(allPrices[allPrices.length - 1]).toBe(0);
      expect(orderBookPrices).toEqual([]);
    });

    it("should return empty arrays for null order book data", () => {
      const { allPrices, orderBookPrices } = getPricesForOrderBook(null);

      expect(allPrices).toEqual([]);
      expect(orderBookPrices).toEqual([]);
    });
  });
});
