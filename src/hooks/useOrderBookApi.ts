import { useEffect, useState } from "react";

import { OrderBookData, OrderBookSide, UserOrder } from "../types/orderBook";
import { generateMockOrderBookData } from "../utils/mockOrderBookGenerator";

const useOrderBookApi = (ticker: string) => {
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(
    null
  );

  useEffect(() => {
    const mockData = generateMockOrderBookData(ticker, 100);

    // empty order book
    // const mockData = {
    //   asks: [],
    //   bids: [],
    //   lastTradedPrice: 50000,
    //   ticker: "BTCUSDT",
    //   tickerDisplayName: "BTC/USDT",
    // };

    setOrderBookData(mockData);
  }, [ticker]);

  const addUserOrder = (userOrder: UserOrder) => {
    setOrderBookData((prevData) => {
      if (!prevData) return null;

      const { price, size, side } = userOrder;

      const updatedSide = [
        ...prevData[side === OrderBookSide.BID ? "bids" : "asks"],
      ];

      updatedSide.push({ price, size, isUserOrder: true });

      return {
        ...prevData,
        [side === OrderBookSide.BID ? "bids" : "asks"]: updatedSide,
      };
    });
  };

  return { orderBookData, addUserOrder };
};

export default useOrderBookApi;
