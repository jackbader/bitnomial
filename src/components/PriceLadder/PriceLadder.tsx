import { FC, useEffect, useMemo, useState } from 'react';
import useOrderBookApi from '../../hooks/useOrderBookApi';
import { OrderBookPriceMap, OrderBookSide, UserOrder } from '../../types/orderBook';
import { aggregateOrderBookEntries } from './priceLadderUtils';
import PriceLadderInnerList from './PriceLadderInnerList';

interface PriceLadderProps {
    ticker: string;
}

const PriceLadder: FC<PriceLadderProps> = (props) => {
    const { ticker } = props;
    const { orderBookData, addUserOrder } = useOrderBookApi(ticker);
    const tickerDisplayName = orderBookData?.tickerDisplayName || ticker;

    const [allPrices, setAllPrices] = useState<number[]>([]);
    const [orderBookPriceMap, setOrderBookPriceMap] = useState<OrderBookPriceMap>(new Map());
    const [shouldShowAllPrices, setShouldShowAllPrices] = useState(true);

    const submitUserOrder = (userOrder: UserOrder) => {
        // if allPrices doesnt contain this new order price generate new prices to fill in the gap
        if (!allPrices.includes(userOrder.price)) {
            const highestPrice = allPrices[0];
            const lowestPrice = allPrices[allPrices.length - 1];

            const isBid = userOrder.side === OrderBookSide.BID;
            const step = isBid ? 1 : -1;
            const startingPrice = isBid
                ? Math.max(userOrder.price - 1000, 0)
                : userOrder.price + 1000;
            const endPrice = isBid ? lowestPrice : highestPrice;

            const prices = [];
            for (let i = startingPrice; step > 0 ? i < endPrice : i > endPrice; i += step) {
                prices.push(i);
            }

            const newPrices = [...prices, ...allPrices].sort((a, b) => b - a);
            setAllPrices(newPrices);
        }

        addUserOrder(userOrder);
    };

    const toggleShowAllPrices = () => {
        setShouldShowAllPrices(!shouldShowAllPrices);
    };

    // update order book price map every time order book data changes
    useEffect(() => {
        if (!orderBookData) return;
        const aggregatedMap = aggregateOrderBookEntries(orderBookData);
        setOrderBookPriceMap(aggregatedMap);
    }, [orderBookData]);

    // generate initial pricesToShow
    useEffect(() => {
        if (!orderBookData) return;

        // dont update pricesToShow if already set
        if (allPrices.length > 0) return;

        const { lastTradedPrice } = orderBookData;

        const range = 20000;
        const prices = [];
        for (let i = lastTradedPrice + range; i > lastTradedPrice - range - 1; i--) {
            prices.push(i);
        }

        setAllPrices(prices);
    }, [orderBookData, allPrices]);

    const midPointPrice = useMemo(() => {
        if (!orderBookData) return 0;

        if (orderBookData.bids.length === 0 || orderBookData.asks.length === 0) {
            return orderBookData.lastTradedPrice;
        }

        const bestBid = orderBookData.bids.sort((a, b) => b.price - a.price)[0].price;
        const bestAsk = orderBookData.asks.sort((a, b) => a.price - b.price)[0].price;

        return Math.round((bestBid + bestAsk) / 2);
    }, [orderBookData]);

    if (allPrices.length === 0) return null;

    const pricesToShow = shouldShowAllPrices
        ? allPrices
        : allPrices.filter((price) => {
              return orderBookPriceMap.has(price) || price === midPointPrice;
          });

    return (
        <PriceLadderInnerList
            addUserOrder={submitUserOrder}
            tickerDisplayName={tickerDisplayName}
            shouldShowAllPrices={shouldShowAllPrices}
            toggleShowAllPricesInRange={toggleShowAllPrices}
            pricesToShow={pricesToShow}
            midPointPrice={midPointPrice}
            orderBookPriceMap={orderBookPriceMap}
        />
    );
};

export default PriceLadder;
