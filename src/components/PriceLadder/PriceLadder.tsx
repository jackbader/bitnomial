import { FC, useEffect, useRef, useState } from "react";
import { OrderBookData } from "../../types/orderBook";
import {
  getAggregatedOrderBookByPrice,
  getOrderBookCenterPrice,
  generatePriceRange,
} from "../../utils/orderBookUtils";
import {
  ListChildComponentProps,
  VariableSizeList,
  VariableSizeListProps,
} from "react-window";
import styles from "./PriceLadder.module.css";

interface PriceLadderProps {
  orderBookData: OrderBookData;
  lastTradedPrice: number;
}

const PriceLadder: FC<PriceLadderProps> = (props) => {
  const { orderBookData, lastTradedPrice } = props;

  const listRef = useRef<VariableSizeList>(null);
  const hasDoneInitialScroll = useRef(false);

  const orderBookAggregatesByPrice =
    getAggregatedOrderBookByPrice(orderBookData);
  const centerPrice = getOrderBookCenterPrice(lastTradedPrice, orderBookData);
  const prices = generatePriceRange(centerPrice, 1000); // will generate 1000 prices below and above center price
  const centerIndex = prices.findIndex((price) => price <= centerPrice);

  console.log("aggregatedData", orderBookAggregatesByPrice);
  console.log("center price", centerPrice);
  console.log("prices", prices);

  // Handles initial scroll to center
  useEffect(() => {
    if (listRef.current && !hasDoneInitialScroll.current) {
      listRef.current.scrollToItem(centerIndex, "center");
      hasDoneInitialScroll.current = true;
    }
  }, [centerIndex]);

  const getItemSize = () => 36;
  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const price = prices[index];
    const entry = orderBookAggregatesByPrice.get(price);

    return (
      <div style={style} className={styles.row}>
        <div className={styles.bidColumn}>
          {entry && entry?.bidsTotalVolume > 0 && entry?.bidsTotalVolume}
        </div>
        <div className={styles.priceColumn}>{price}</div>
        <div className={styles.askColumn}>
          {entry && entry?.asksTotalVolume > 0 && entry?.asksTotalVolume}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.priceLadderContainer}>
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
    </div>
  );
};

export default PriceLadder;
