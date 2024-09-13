import { FormatAlignCenter, VerticalAlignCenter } from "@mui/icons-material"; // Add this import
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { OrderBookData } from "../../types/orderBook";
import {
  generatePriceRange,
  getAggregatedOrderBookByPrice,
  getOrderBookCenterPrice,
} from "../../utils/orderBookUtils";
import styles from "./PriceLadder.module.css";
import { aggregateOrderBookEntries } from "./priceLadderUtils";

interface PriceLadderProps {
  orderBookData: OrderBookData;
  lastTradedPrice: number;
  priceRange: number;
}

const PriceLadder: FC<PriceLadderProps> = (props) => {
  const { orderBookData, lastTradedPrice, priceRange } = props;

  const listRef = useRef<FixedSizeList>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const orderBookAggregates = useMemo(() => {
    return aggregateOrderBookEntries(orderBookData);
  }, [orderBookData]);

  const orderBookAggregatesByPrice = useMemo(() => {
    return new Map(orderBookAggregates.map((entry) => [entry.price, entry]));
  }, [orderBookAggregates]);

  const { centerPrice, highestBid, lowestAsk } = useMemo(
    () => getOrderBookCenterPrice(lastTradedPrice, orderBookData),
    [orderBookData, lastTradedPrice]
  );

  const prices = useMemo(() => {
    return generatePriceRange(highestBid, lowestAsk, priceRange);
  }, [highestBid, lowestAsk, priceRange]);

  const filteredPrices = useMemo(() => {
    return !isCollapsed
      ? prices
      : prices.filter((price) => orderBookAggregatesByPrice.has(price));
  }, [isCollapsed, prices, orderBookAggregatesByPrice]);

  const centerIndex = !isCollapsed
    ? priceRange
    : filteredPrices.findIndex((price) => price <= centerPrice);

  const [selectedIndex, setSelectedIndex] = useState<number>(centerIndex);

  // Handles initial scrolling to center & scrolling to new selected index
  useEffect(() => {
    if (selectedIndex !== null && listRef.current) {
      listRef.current.scrollToItem(selectedIndex, "center");
    }
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(centerIndex);
  }, [centerIndex]);

  const scrollToCenter = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(centerIndex, "center");
    }
  };

  const toggleIsCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  const rowRenderer = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const price = filteredPrices[index];
      const entry = orderBookAggregatesByPrice.get(price);

      const rowStyle = {
        ...style,
        backgroundColor:
          price === highestBid
            ? "rgba(0, 255, 0, 0.1)"
            : price === lowestAsk
            ? "rgba(255, 0, 0, 0.1)"
            : "transparent",
      };

      return (
        <div style={rowStyle} className={styles.row}>
          <div className={styles.bidColumn}>
            {entry && entry?.bidsTotalVolume > 0 && (
              <span className={styles.bidPill}>{entry.bidsTotalVolume}</span>
            )}
          </div>
          <div className={styles.priceColumn}>{price}</div>
          <div className={styles.askColumn}>
            {entry && entry?.asksTotalVolume > 0 && (
              <span className={styles.askPill}>{entry.asksTotalVolume}</span>
            )}
          </div>
        </div>
      );
    },
    [filteredPrices, highestBid, lowestAsk, orderBookAggregatesByPrice]
  );

  return (
    <div className={styles.priceLadderContainer}>
      <div className={styles.header}>
        <div className={styles.bidColumn}>Bid</div>
        <div className={styles.priceColumn}>Price</div>
        <div className={styles.askColumn}>Ask</div>
      </div>

      <FixedSizeList
        height={396}
        itemCount={filteredPrices.length}
        itemSize={36}
        width="100%"
        ref={listRef}
        className={styles.list}
        layout="vertical"
      >
        {rowRenderer}
      </FixedSizeList>

      <div className={styles.footerContainer}>
        <button onClick={toggleIsCollapsed} className={styles.centerButton}>
          <VerticalAlignCenter />
        </button>
        <button onClick={scrollToCenter} className={styles.centerButton}>
          <FormatAlignCenter />
        </button>
      </div>
    </div>
  );
};

export default PriceLadder;
