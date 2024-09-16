import { FC, useMemo, useState } from "react";
import useOrderBookApi from "../../hooks/useOrderBookApi";
import PriceLadderInnerList from "./PriceLadderInnerList";
import { getPricesForOrderBook } from "./priceLadderUtils";

interface PriceLadderNewProps {
  ticker: string;
}

const PriceLadderNew: FC<PriceLadderNewProps> = (props) => {
  const { ticker } = props;
  const { orderBookData, addUserOrder } = useOrderBookApi(ticker);

  // center price is based on non-user bids and asks, because there is no order valdiation at this point
  const { allPrices, orderBookPrices, centerPrice } = useMemo(
    () => getPricesForOrderBook(orderBookData),
    [orderBookData]
  );

  const [shouldShowAllPrices, setShouldShowAllprices] = useState(false);

  const toggleShowAllPricesInRange = () => {
    setShouldShowAllprices(!shouldShowAllPrices);
  };

  const pricesToShow = shouldShowAllPrices ? allPrices : orderBookPrices;
  const closestIndexToCenterPrice = useMemo(() => {
    return pricesToShow.reduce((closest, price, index) => {
      return Math.abs(price - centerPrice) <
        Math.abs(pricesToShow[closest] - centerPrice)
        ? index
        : closest;
    }, 0);
  }, [centerPrice, pricesToShow]);

  if (!orderBookData) return null;

  return (
    <div>
      {pricesToShow.length > 0 && (
        <PriceLadderInnerList
          addUserOrder={addUserOrder}
          ticker={ticker}
          shouldShowAllPrices={shouldShowAllPrices}
          toggleShowAllPricesInRange={toggleShowAllPricesInRange}
          pricesToShow={pricesToShow}
          closestIndexToCenterPrice={closestIndexToCenterPrice}
          orderBookData={orderBookData}
        />
      )}
    </div>
  );
};

export default PriceLadderNew;
