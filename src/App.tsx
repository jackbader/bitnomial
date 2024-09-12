import { useCallback, useEffect } from "react";
import styles from "./App.module.css";
import BiDirectionalInfiniteList from "./components/BiDirectionalIfiniteList";
import useOrderBook from "./hooks/useOrderBook";
import { OrderBookSide } from "./types/orderBook";
import PriceLadder from "./components/PriceLadder/PriceLadder";

// Central Limit Order Book Market
// - buy and sell orders are collected and matched.

// Order Book:

// This is the core data structure of the exchange.
// It's a record of all open buy and sell orders for a specific financial instrument (like a futures contract).
// It contains information on who wants to buy or sell, at what price, and in what quantity.

// Market Depth:

// This refers to the total volume of orders at each price level.
// It gives traders an idea of the buying and selling interest at different prices.

// Price Ladder:

// This is a visual representation of the market depth.
// It's a vertical list of price levels:

// Higher prices are at the top
// Lower prices are at the bottom

// Buy orders (bids) are at lower prices
// Sell orders (asks) are at higher prices

// Price Ladder Display:

// Each price level shows the total volume of buy and sell orders at that price.
// Buy orders (bids) are displayed:
// On the left side of the price ladder
// In green color

// Sell orders (asks) are displayed:
// On the right side of the price ladder
// In red color

function App() {
  const { orderBookData, loading, error } = useOrderBook();

  const shouldShowPriceLadder = !loading && !error && orderBookData;
  const lastTradedPrice = 5000;

  return (
    <div className={styles.container}>
      {shouldShowPriceLadder && (
        <PriceLadder
          lastTradedPrice={lastTradedPrice}
          orderBookData={orderBookData}
        />
      )}
    </div>
  );
}

export default App;
