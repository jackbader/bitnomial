import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { VariableSizeList as List } from "react-window";
import {
  OrderBookData,
  OrderBookEntry,
  OrderBookSide,
} from "../types/orderBook";
import { getCenterPrice } from "../utils/orderBookUtils";
import styles from "./BiDirectionalInfiniteList.module.css";
import useOrderBook from "../hooks/useOrderBook";

interface BiDirectionalInfiniteListProps {
  orderBookData: OrderBookData;
  lastTradedPrice: number;
}

const getItemSize = () => 36;

const BiDirectionalInfiniteList = (props: BiDirectionalInfiniteListProps) => {
  const { orderBookData, lastTradedPrice } = props;

  const [orderBookEntriesMap, setOrderBookEntriesMap] = useState(new Map());

  const [version, setVersion] = useState(0);

  useEffect(() => {
    console.log("orderBookEntries UPDATEd", orderBookEntries);
    const newMap = new Map(
      orderBookEntries.map((entry) => [entry.price, entry])
    );
    console.log("newMap", newMap.get(50005));
    setOrderBookEntriesMap(newMap);
    setVersion((v) => v + 1);
  }, [orderBookEntries]);

  const { addOrder } = useOrderBook();

  console.log("orderBookEntriesMap size", orderBookEntriesMap.size);

  console.log("re-rendering bi flat list", orderBookEntriesMap.get(50005));

  const [showBlankPrices, setShowBlankPrices] = useState(true);
  const [activeInput, setActiveInput] = useState<{
    index: number;
    side: "buy" | "sell";
  } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("orderBookEntriesMap", orderBookEntriesMap.size);

  const centerPrice = getCenterPrice(lastTradedPrice, orderBookEntries);

  const prices: number[] = [];
  for (let i = centerPrice + 1000; i >= centerPrice - 1000; i--) {
    prices.push(i);
  }

  const filteredPrices = showBlankPrices
    ? prices
    : prices.filter((price) => orderBookEntriesMap.has(price));

  const centerIndex = showBlankPrices
    ? 1000
    : filteredPrices.findIndex((price) => price <= centerPrice);

  useEffect(() => {
    setSelectedIndex(centerIndex);
  }, [centerIndex]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const toggleBlankPrices = () => {
    setShowBlankPrices(!showBlankPrices);
    if (showBlankPrices) {
      listRef.current?.scrollToItem(100, "center");
    }
  };

  const handleInputClick = (index: number, side: "buy" | "sell") => {
    setActiveInput({ index, side });
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (activeInput && inputValue) {
      const amount = parseFloat(inputValue);
      if (!isNaN(amount) && amount > 0) {
        const price = filteredPrices[activeInput.index];
        const side =
          activeInput.side === "buy" ? OrderBookSide.BID : OrderBookSide.ASK;
        console.log("add order!!", price, amount, side);
        addOrder(price, amount, side);
        console.log(`Added ${amount} ${side} order at price ${price}`);
      }
    }
    setActiveInput(null);
    setInputValue("");
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prevIndex) =>
          prevIndex !== null ? Math.max(0, prevIndex - 1) : null
        );
      } else if (event.key === "ArrowDown") {
        setSelectedIndex((prevIndex) =>
          prevIndex !== null
            ? Math.min(filteredPrices.length - 1, prevIndex + 1)
            : null
        );
      } else if (event.key === "b" || event.key === "s") {
        if (selectedIndex !== null) {
          setActiveInput({
            index: selectedIndex,
            side: event.key === "b" ? "buy" : "sell",
          });
          setInputValue("");
        }
      }
    },
    [filteredPrices.length, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (selectedIndex !== null && listRef.current) {
      listRef.current.scrollToItem(selectedIndex, "center");
    }
  }, [selectedIndex]);

  const renderInputOrText = (index: number, side: "buy" | "sell") => {
    if (activeInput?.index === index && activeInput?.side === side) {
      return (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          autoFocus
        />
      );
    }
    return side === "buy" ? "Buy" : "Sell";
  };

  const rowRenderer = useCallback(
    ({ index, style }) => {
      const price = filteredPrices[index];
      const entry = orderBookEntriesMap.get(price);

      if (price === 50005) {
        console.log("price", price, "entry", entry);
      }

      return (
        <div
          style={style}
          key={price}
          className={`${styles.row} ${
            index % 2 === 0 ? styles.evenRow : styles.oddRow
          } ${index === selectedIndex ? styles.selectedRow : ""}`}
        >
          <div
            className={styles.buyColumn}
            onClick={() => handleInputClick(index, "buy")}
          >
            {renderInputOrText(index, "buy")}
          </div>
          <div className={styles.bidColumn}>
            {entry?.side === OrderBookSide.BID && (
              <span className={styles.bidPill}>{entry.amount}</span>
            )}
          </div>
          <div className={`${styles.priceColumn} ${styles.columnDivider}`}>
            {price}
          </div>
          <div className={styles.askColumn}>
            {entry?.side === OrderBookSide.ASK && (
              <span className={styles.askPill}>{entry.amount}</span>
            )}
          </div>
          <div
            className={styles.sellColumn}
            onClick={() => handleInputClick(index, "sell")}
          >
            {renderInputOrText(index, "sell")}
          </div>
        </div>
      );
    },
    [filteredPrices, orderBookEntriesMap, selectedIndex]
  );

  return (
    <div ref={containerRef} tabIndex={0} className={styles.container}>
      <div className={styles.glassPanel}>
        <div className={styles.header}>
          <div className={styles.buyColumn}>Buy</div>
          <div className={styles.bidColumn}>Bid</div>
          <div className={`${styles.priceColumn} ${styles.columnDivider}`}>
            Price
          </div>
          <div className={styles.askColumn}>Ask</div>
          <div className={styles.sellColumn}>Sell</div>
        </div>
        <List
          height={400}
          itemCount={filteredPrices.length}
          itemSize={getItemSize}
          width="100%"
          ref={listRef}
          className={styles.list}
          itemData={{ orderBookEntriesMap, filteredPrices, version }}
        >
          {rowRenderer}
        </List>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => listRef.current?.scrollToItem(centerIndex, "center")}
            className={styles.button}
          >
            Scroll to Center
          </button>
          <button onClick={toggleBlankPrices} className={styles.button}>
            {showBlankPrices ? "Hide Blank Prices" : "Show All Prices"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiDirectionalInfiniteList;
