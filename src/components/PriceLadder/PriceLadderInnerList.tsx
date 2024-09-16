import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { OrderBookData, UserOrder } from "../../types/orderBook";
import Button from "../common/Button";
import styles from "./PriceLadderInnerList.module.css";
import PriceLadderSubmitOrder from "./PriceLadderSubmitOrder";
import { aggregateOrderBookEntries } from "./priceLadderUtils";
import "./PriceLadderInnerList.css"; // Add this import

interface PriceLadderInnerListProps {
  orderBookData: OrderBookData;
  toggleShowAllPricesInRange: () => void;
  pricesToShow: number[];
  closestIndexToCenterPrice: number;
  shouldShowAllPrices: boolean;
  ticker: string;
  addUserOrder: (order: UserOrder) => void;
}

const PriceLadderInnerList: FC<PriceLadderInnerListProps> = (props) => {
  const {
    orderBookData,
    toggleShowAllPricesInRange,
    shouldShowAllPrices,
    pricesToShow,
    closestIndexToCenterPrice,
    ticker,
    addUserOrder,
  } = props;

  const [selectedIndex, setSelectedIndex] = useState(closestIndexToCenterPrice);
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");

  const priceInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<FixedSizeList>(null);
  const hasDoneInitialScroll = useRef(false);
  const lastShouldShouldAllPrices = useRef(shouldShowAllPrices);

  // map of order prices and their aggregated order book volume sizes
  const orderBookPriceMap = useMemo(() => {
    if (!orderBookData) return new Map();
    return aggregateOrderBookEntries(orderBookData);
  }, [orderBookData]);

  const scrollToCenter = useCallback(() => {
    listRef.current?.scrollToItem(closestIndexToCenterPrice, "center");
    setSelectedIndex(closestIndexToCenterPrice);
  }, [closestIndexToCenterPrice]);

  // scrolls list to center on initial render and when showAllPricesInRange changes
  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    if (!hasDoneInitialScroll.current) {
      scrollToCenter();
      hasDoneInitialScroll.current = true;
      return;
    }

    if (lastShouldShouldAllPrices.current !== shouldShowAllPrices) {
      lastShouldShouldAllPrices.current = shouldShowAllPrices;

      // scroll to center after list has updated
      requestAnimationFrame(() => {
        scrollToCenter();
      });
      return;
    }
  }, [
    scrollToCenter,
    hasDoneInitialScroll,
    shouldShowAllPrices,
    lastShouldShouldAllPrices,
  ]);

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

    if (event.key === "b" || event.key === "s") {
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
    const isCenterPrice = index === closestIndexToCenterPrice;

    const rowClassName = `${styles.row} ${
      isCenterPrice ? styles.centerPriceRow : ""
    }`;

    const hasBids = item?.totalBidsSize > 0;
    const hasUserBids = item?.totalUserBids > 0;
    const hasAsks = item?.totalAsksSize > 0;
    const hasUserAsks = item?.totalUserAsks > 0;

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
        <div
          className={`${styles.rowText} ${styles.centerRowText} ${
            isSelected ? styles.selectedRowPrice : ""
          } `}
        >
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{ticker}</h2>

      <div className={styles.buttonContainer}>
        <Button onClick={toggleShowAllPricesInRange}>
          {shouldShowAllPrices ? "Collapse" : "Expand"} View
        </Button>
        <Button onClick={() => scrollToCenter()}>Scroll to Center</Button>
      </div>

      <div className={styles.headerRow}>
        <div className={styles.rowText}>Bids</div>
        <div className={styles.rowText}>Price</div>
        <div className={styles.rowText}>Asks</div>
      </div>

      <FixedSizeList
        height={396}
        itemCount={pricesToShow.length}
        itemSize={36}
        width="100%"
        ref={listRef}
        className={`${styles.list} hideScrollbar`} // Add 'hideScrollbar' class
        layout="vertical"
      >
        {rowRenderer}
      </FixedSizeList>

      <PriceLadderSubmitOrder
        addUserOrder={addUserOrder}
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

export default memo(PriceLadderInnerList, (prevProps, nextProps) => {
  return (
    prevProps.orderBookData === nextProps.orderBookData &&
    prevProps.shouldShowAllPrices === nextProps.shouldShowAllPrices &&
    prevProps.pricesToShow === nextProps.pricesToShow
  );
});
