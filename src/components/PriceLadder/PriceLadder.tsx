import { FC, useEffect, useMemo, useState } from "react";
import useOrderBookApi from "../../hooks/useOrderBookApi";
import PriceLadderInnerList from "./PriceLadderInnerList";
import { getPricesForOrderBook } from "./priceLadderUtils";

interface PriceLadderNewProps {
  ticker: string;
}

const PriceLadderNew: FC<PriceLadderNewProps> = (props) => {
  const { ticker } = props;
  const { orderBookData, addUserOrder } = useOrderBookApi(ticker);

  const [shouldShowAllPrices, setShouldShowAllprices] = useState(false);
  const [pricesToShow, setPricesToShow] = useState<number[]>([]);

  // get list of prices to show
  const {
    allPrices,
    orderBookPrices,
    centerPrice: estimatedCenterPrice,
  } = useMemo(() => getPricesForOrderBook(orderBookData), [orderBookData]);

  const realCenterPrice = useMemo(() => {
    // find the price in pricesToShow that is closest to the estimatedCenterPrice
    // since the center price wont always be in pricesToShow, we need to find the closest price
    return pricesToShow.reduce((minPrice, price) => {
      const minPriceDifference = Math.abs(minPrice - estimatedCenterPrice);
      const priceDifference = Math.abs(price - estimatedCenterPrice);
      return priceDifference < minPriceDifference ? price : minPrice;
    }, pricesToShow[0]);
  }, [pricesToShow, estimatedCenterPrice]);

  const toggleShowAllPricesInRange = () => {
    setShouldShowAllprices((prev) => !prev);
  };

  useEffect(() => {
    if (shouldShowAllPrices) {
      setPricesToShow(allPrices);
    } else {
      setPricesToShow(orderBookPrices);
    }
  }, [shouldShowAllPrices, allPrices, orderBookPrices]);

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
          centerPrice={realCenterPrice}
          orderBookData={orderBookData}
        />
      )}
    </div>
  );
};

export default PriceLadderNew;
