import { useEffect, useState } from "react";
import { OrderBookData } from "../types/orderBook";
import { generateMockOrderBookData } from "../utils/mockOrderBookGenerator";

// TODO:
// ideally from the "backend" we would recieve an object with an array of bids and asks...

// we would then aggregate the bids and asks into a map with the price as the key and the entry or entries as the value so we can know which orders are the users orders
// this would allow us to easily update the order book as we receive new data

// we also just need to know the center price so we can calculate the spread and know where to center the list

function useOrderBook() {
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      console.log("fetching initial order book!!!");
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockOrderBookData = generateMockOrderBookData();

        console.log("mock order book data", mockOrderBookData);

        setOrderBookData(mockOrderBookData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
        setLoading(false);
      }
    };

    fetchOrderBook();
  }, []);

  return { orderBookData, loading, error };
}

export default useOrderBook;
