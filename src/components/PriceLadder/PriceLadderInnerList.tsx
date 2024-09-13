import { FC, memo, useRef } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import styles from "./PriceLadderInnerList.module.css";

interface AggregatedEntry {
  totalBidsSize: number;
  totalAsksSize: number;
  totalUserBidsSize: number;
  totalUserAsksSize: number;
}

interface PriceLadderInnerListProps {
  orderBookPriceMap: Map<number, AggregatedEntry>;
  pricesToShow: number[];
}

const PriceLadderInnerList: FC<PriceLadderInnerListProps> = (props) => {
  const { orderBookPriceMap, pricesToShow } = props;
  const listRef = useRef<FixedSizeList>(null);

  console.log("re-rendering inner list", orderBookPriceMap);

  const rowRenderer = ({ index, style }: ListChildComponentProps) => {
    const price = pricesToShow[index];
    const item = orderBookPriceMap.get(price);

    return (
      <div className={styles.row} key={price} style={style}>
        <div>{price}</div>
        <div>{item?.totalBidsSize}</div>
        <div>{item?.totalAsksSize}</div>
        <div>{item?.totalUserBidsSize}</div>
        <div>{item?.totalUserAsksSize}</div>
      </div>
    );
  };

  return (
    <FixedSizeList
      height={396}
      itemCount={pricesToShow.length}
      itemSize={36}
      width="100%"
      ref={listRef}
      className={styles.list}
      layout="vertical"
    >
      {rowRenderer}
    </FixedSizeList>
  );
};

export default memo(PriceLadderInnerList, (prevProps, nextProps) => {
  return (
    prevProps.orderBookPriceMap === nextProps.orderBookPriceMap &&
    prevProps.pricesToShow === nextProps.pricesToShow
  );
});
