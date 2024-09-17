import { FC, useEffect, useRef, useState, useMemo } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { OrderBookPriceMap, UserOrder } from "../../types/orderBook";
import Button from "../common/Button";
import styles from "./PriceLadderInnerList.module.css";
import PriceLadderSubmitOrder from "./PriceLadderSubmitOrder";

interface PriceLadderInnerListProps {
  orderBookPriceMap: OrderBookPriceMap;
  toggleShowAllPricesInRange: () => void;
  pricesToShow: number[];
  shouldShowAllPrices: boolean;
  ticker: string;
  midPointPrice: number;
  addUserOrder: (order: UserOrder) => void;
}

// Configurable constants
const ITEM_SIZE = 20;
const VIEWABLE_ROWS_ABOVE_AND_BELOW_MIDPOINT = 10;

// Derived constants - DO NOT MODIFY DIRECTLY
const TOTAL_VIEWABLE_ROWS = 2 * VIEWABLE_ROWS_ABOVE_AND_BELOW_MIDPOINT + 1;
const LIST_VIEW_PORT_HEIGHT = ITEM_SIZE * TOTAL_VIEWABLE_ROWS;

const PriceLadderInnerList: FC<PriceLadderInnerListProps> = (props) => {
  const {
    orderBookPriceMap,
    toggleShowAllPricesInRange,
    shouldShowAllPrices,
    pricesToShow,
    midPointPrice,
    ticker,
    addUserOrder,
  } = props;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");

  const priceInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<FixedSizeList>(null);

  const shouldScrollToCenterOnNextRender = useRef(false);
  const orderPriceToScrollToOnNextRender = useRef<number | null>(null);

  const scrollToPrice = (price: number) => {
    const index = pricesToShow.indexOf(price);
    // on next frame
    requestAnimationFrame(() => {
      listRef.current?.scrollToItem(index, "center");
    });
  };

  const clickedShouldShowAllPrices = () => {
    shouldScrollToCenterOnNextRender.current = true;
    toggleShowAllPricesInRange();
  };

  const submitUserOrder = (userOrder: UserOrder) => {
    orderPriceToScrollToOnNextRender.current = userOrder.price;
    addUserOrder(userOrder);
  };

  // handles scrolling to a specific order when a user submits an order
  useEffect(() => {
    if (orderPriceToScrollToOnNextRender.current) {
      console.log(
        "scroll to specific order",
        orderPriceToScrollToOnNextRender.current
      );
      scrollToPrice(orderPriceToScrollToOnNextRender.current);
      orderPriceToScrollToOnNextRender.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderBookPriceMap]); // (only when order book changes)

  // handles scrolling when shouldShowAllPrices is toggled
  useEffect(() => {
    if (shouldScrollToCenterOnNextRender.current) {
      scrollToPrice(midPointPrice);
      shouldScrollToCenterOnNextRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesToShow]); // (only when actual price list is updated, no other state changes)

  const handleRowClick = (price: number) => {
    const clickedIndex = pricesToShow.indexOf(price);
    setSelectedIndex(clickedIndex);
    setPrice(price.toString());
    setSize("");
    sizeInputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const price = pricesToShow[selectedIndex];
      handleRowClick(price);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const direction = event.key === "ArrowUp" ? -1 : 1;
      const MIN_INDEX = 0;
      const MAX_INDEX = pricesToShow.length - 1;
      const newSelectedIndex = Math.max(
        MIN_INDEX,
        Math.min(selectedIndex + direction, MAX_INDEX)
      );
      listRef.current?.scrollToItem(newSelectedIndex, "smart");
      setSelectedIndex(newSelectedIndex);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const price = pricesToShow[index];
    const item = orderBookPriceMap.get(price);
    const isSelected = index === selectedIndex;
    const isMidPointPrice = price === midPointPrice;

    const rowClassName = `${styles.row} ${
      isMidPointPrice ? styles.midPointPriceRow : ""
    } ${isSelected ? styles.selectedRow : ""}`;

    const hasBids = item?.totalBidsSize !== undefined && item.totalBidsSize > 0;
    const hasUserBids =
      item?.totalUserBids !== undefined && item.totalUserBids > 0;
    const hasAsks = item?.totalAsksSize !== undefined && item.totalAsksSize > 0;
    const hasUserAsks =
      item?.totalUserAsks !== undefined && item.totalUserAsks > 0;

    return (
      <div
        className={rowClassName}
        key={price}
        style={style}
        onClick={() => handleRowClick(price)}
      >
        <div
          className={`${styles.rowText} ${hasBids ? styles.bidRowText : ""}`}
        >
          {hasBids ? item?.totalBidsSize : ""}
          {hasUserBids && (
            <span className={styles.userOrderSize}>({item.totalUserBids})</span>
          )}
        </div>
        <div className={`${styles.rowText} ${styles.centerRowText}`}>
          {price}
        </div>
        <div
          className={`${styles.rowText} ${hasAsks ? styles.askRowText : ""}`}
        >
          {hasAsks ? item?.totalAsksSize : ""}
          {hasUserAsks && (
            <span className={styles.userOrderSize}>({item.totalUserAsks})</span>
          )}
        </div>
      </div>
    );
  };

  // Calculate the initial scroll offset only once
  const initialScrollOffset = useMemo(() => {
    const midPointIndex = pricesToShow.indexOf(midPointPrice);
    const indexOffset = VIEWABLE_ROWS_ABOVE_AND_BELOW_MIDPOINT;
    const scrollIndex = midPointIndex - indexOffset;
    return scrollIndex * ITEM_SIZE;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{ticker}</h2>

      <div className={styles.buttonContainer}>
        <Button
          disabled={orderBookPriceMap.size === 0}
          onClick={clickedShouldShowAllPrices}
        >
          {shouldShowAllPrices ? "Collapse" : "Expand"} View
        </Button>

        <Button onClick={() => scrollToPrice(midPointPrice)}>
          Scroll to Center
        </Button>
      </div>

      <div className={styles.headerRow}>
        <div className={styles.rowText}>Bids</div>
        <div className={styles.rowText}>Price</div>
        <div className={styles.rowText}>Asks</div>
      </div>

      <FixedSizeList
        height={LIST_VIEW_PORT_HEIGHT}
        itemCount={pricesToShow.length}
        itemSize={ITEM_SIZE}
        width="100%"
        ref={listRef}
        className={styles.list}
        layout="vertical"
        initialScrollOffset={initialScrollOffset}
      >
        {rowRenderer}
      </FixedSizeList>

      <PriceLadderSubmitOrder
        addUserOrder={submitUserOrder}
        price={price}
        size={size}
        setPrice={setPrice}
        setSize={setSize}
        priceInputRef={priceInputRef}
        sizeInputRef={sizeInputRef}
      />
    </div>
  );
};

export default PriceLadderInnerList;
