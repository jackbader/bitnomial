import { FC, useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { OrderBookPriceMap, UserOrder } from "../../types/orderBook";
import Button from "../common/Button";
import styles from "./PriceLadderInnerList.module.css";
import PriceLadderRow from "./PriceLadderRow";
import PriceLadderSubmitOrder from "./PriceLadderSubmitOrder";

interface PriceLadderInnerListProps {
  orderBookPriceMap: OrderBookPriceMap;
  toggleShowAllPricesInRange: () => void;
  pricesToShow: number[];
  shouldShowAllPrices: boolean;
  tickerDisplayName: string;
  midPointPrice: number;
  addUserOrder: (order: UserOrder) => void;
}

// Configurable constants
const ITEM_SIZE = 22;
const VIEWABLE_ROWS_ABOVE_AND_BELOW_MIDPOINT = 8;

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
    tickerDisplayName,
    addUserOrder,
  } = props;

  const [selectedIndex, setSelectedIndex] = useState(
    pricesToShow.indexOf(midPointPrice)
  );
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

    setSelectedIndex(index);
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

  // Calculate the initial scroll offset only once
  const initialScrollOffset = useMemo(() => {
    const midPointIndex = pricesToShow.indexOf(midPointPrice);
    const indexOffset = VIEWABLE_ROWS_ABOVE_AND_BELOW_MIDPOINT;
    const scrollIndex = midPointIndex - indexOffset;
    return scrollIndex * ITEM_SIZE;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const price = pricesToShow[index];
    const item = orderBookPriceMap.get(price);

    return (
      <PriceLadderRow
        key={price}
        price={price}
        item={item}
        isSelected={index === selectedIndex}
        isMidPointPrice={price === midPointPrice}
        onClick={handleRowClick}
        style={style}
      />
    );
  };

  return (
    <div className={styles.priceLadderContainer}>
      <h2 className={styles.tickerDisplayName}>{tickerDisplayName}</h2>

      <div>
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

      <div className={styles.priceLadderHeader}>
        <div>Bids</div>
        <div>Price</div>
        <div>Asks</div>
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
