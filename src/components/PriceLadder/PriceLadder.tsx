import { FC, useEffect, useRef, useState } from "react";
import { ListChildComponentProps, VariableSizeList } from "react-window";
import { OrderBookData } from "../../types/orderBook";
import {
  generatePriceRange,
  getAggregatedOrderBookByPrice,
  getOrderBookCenterPrice,
} from "../../utils/orderBookUtils";
import styles from "./PriceLadder.module.css";
import { VerticalAlignCenter } from "@mui/icons-material"; // Add this import

interface PriceLadderProps {
  orderBookData: OrderBookData;
  lastTradedPrice: number;
}

const PriceLadder: FC<PriceLadderProps> = (props) => {
  const { orderBookData, lastTradedPrice } = props;

  const listRef = useRef<VariableSizeList>(null);

  const orderBookAggregatesByPrice =
    getAggregatedOrderBookByPrice(orderBookData);
  const centerPrice = getOrderBookCenterPrice(lastTradedPrice, orderBookData);
  const prices = generatePriceRange(centerPrice, 1000); // will generate 1000 prices below and above center price
  const centerIndex = prices.findIndex((price) => price <= centerPrice);

  console.log("aggregatedData", orderBookAggregatesByPrice);
  console.log("center price", centerPrice);
  console.log("prices", prices);

  const [selectedIndex, setSelectedIndex] = useState<number>(centerIndex);

  // Handles initial scrolling to center & scrolling to new selected index
  useEffect(() => {
    if (selectedIndex !== null && listRef.current) {
      listRef.current.scrollToItem(selectedIndex, "center");
    }
  }, [selectedIndex]);

  const scrollToCenter = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(centerIndex, "center");
    }
  };

  const getItemSize = () => 36;
  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const price = prices[index];
    const entry = orderBookAggregatesByPrice.get(price);

    return (
      <div style={style} className={styles.row}>
        <div className={styles.buyColumn} onClick={() => null}>
          Buy
        </div>
        <div className={styles.bidColumn}>
          {entry && entry?.bidsTotalVolume > 0 && entry?.bidsTotalVolume}
        </div>
        <div className={styles.priceColumn}>{price}</div>
        <div className={styles.askColumn}>
          {entry && entry?.asksTotalVolume > 0 && entry?.asksTotalVolume}
        </div>
        <div className={styles.sellColumn} onClick={() => null}>
          Sell
        </div>
      </div>
    );
  };

  return (
    <div className={styles.priceLadderContainer}>
      <div className={styles.header}>
        <div className={styles.buyColumn}>Buy</div>
        <div className={styles.bidColumn}>Bid</div>
        <div className={`${styles.priceColumn} ${styles.columnDivider}`}>
          Price
        </div>
        <div className={styles.askColumn}>Ask</div>
        <div className={styles.sellColumn}>Sell</div>
      </div>

      <VariableSizeList
        height={400}
        itemCount={prices.length}
        itemSize={getItemSize}
        width="100%"
        ref={listRef}
        className={styles.list}
      >
        {rowRenderer}
      </VariableSizeList>

      <div className={styles.footerContainer}>
        <button onClick={scrollToCenter} className={styles.centerButton}>
          <VerticalAlignCenter />
        </button>
      </div>
    </div>
  );
};

export default PriceLadder;
