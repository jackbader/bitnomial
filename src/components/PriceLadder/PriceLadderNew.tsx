import { FC, useMemo, useState } from "react";
import useOrderBook from "../../hooks/useOrderBook";
import {
  aggregateOrderBookEntries,
  getPricesForOrderBook,
} from "./priceLadderUtils";
import PriceLadderSubmitOrder from "./PriceLadderSubmitOrder";
import PriceLadderInnerList from "./PriceLadderInnerList";

interface PriceLadderNewProps {
  ticker: string;
}

const PriceLadderNew: FC<PriceLadderNewProps> = (props) => {
  const { ticker } = props;
  const { orderBookData, addUserOrder } = useOrderBook(ticker);
  const [showAllPricesInRange, setShowAllPricesInRange] = useState(false);

  const orderBookPriceMap = useMemo(() => {
    if (!orderBookData) return new Map();
    return aggregateOrderBookEntries(orderBookData);
  }, [orderBookData]);

  const { allPrices, orderBookPrices } = useMemo(
    () => getPricesForOrderBook(orderBookPriceMap),
    [orderBookPriceMap]
  );

  const toggleShowAllPricesInRange = () => {
    setShowAllPricesInRange(!showAllPricesInRange);
  };

  return (
    <div>
      <h2>{ticker}</h2>
      <button onClick={toggleShowAllPricesInRange}>
        {showAllPricesInRange ? "Collapse" : "Expand"} View
      </button>

      <PriceLadderInnerList
        pricesToShow={showAllPricesInRange ? allPrices : orderBookPrices}
        orderBookPriceMap={orderBookPriceMap}
      />
      <PriceLadderSubmitOrder addUserOrder={addUserOrder} />
    </div>
  );
};

export default PriceLadderNew;
