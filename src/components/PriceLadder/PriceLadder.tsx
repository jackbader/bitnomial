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
    const [shouldShowAllPrices, setShouldShowAllPrices] = useState(false);

    const submitUserOrder = (userOrder: UserOrder) => {
        // if allPrices doesnt contain this price
        // if its a buy order generate more prices to fill between this price and the lowest price
        // if its a sell order generate more prices to fill between this price and the highest price

        if (!allPrices.includes(userOrder.price)) {
            const highestPrice = allPrices[0];
            const lowestPrice = allPrices[allPrices.length - 1];

            if (userOrder.side === OrderBookSide.BID) {
                // generate prices between this price and the lowest price
                const prices = [];
                // try to also generate another 1,000 but dont go below 0
                let startingPrice = userOrder.price - 1000;
                if (startingPrice < 0) {
                    startingPrice = 0;
                }
                for (let i = startingPrice; i < lowestPrice; i++) {
                    prices.push(i);
                }
                const newPrices = [...prices, ...allPrices].sort((a, b) => b - a);
                setAllPrices(newPrices);
            }

            if (userOrder.side === OrderBookSide.ASK) {
                // generate prices between this price and the highest price
                const prices = [];
                const startingPrice = userOrder.price + 1000;
                for (let i = startingPrice; i > highestPrice; i--) {
                    prices.push(i);
                }
                const newPrices = [...prices, ...allPrices].sort((a, b) => b - a);
                setAllPrices(newPrices);
            }
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

    // generate initial prices to show
    useEffect(() => {
        if (!orderBookData) return;

        // dont update prices to show if already set
        if (allPrices.length === 0) {
            const { lastTradedPrice } = orderBookData;

            // get 20,000 prices above and below last traded price
            const range = 20000;
            const prices = [];
            for (let i = lastTradedPrice + range; i > lastTradedPrice - range - 1; i--) {
                prices.push(i);
            }

            setAllPrices(prices);
        }
    }, [orderBookData, allPrices]);

    const midPointPrice = useMemo(() => {
        if (!orderBookData) return 0;

        if (orderBookData.bids.length === 0 || orderBookData.asks.length === 0) {
            return orderBookData.lastTradedPrice;
        }

        // highest price on the buy side.
        const bestBid = orderBookData.bids.sort((a, b) => b.price - a.price)[0].price;
        // lowest price on the sell side.
        const bestAsk = orderBookData.asks.sort((a, b) => a.price - b.price)[0].price;

        return Math.round((bestBid + bestAsk) / 2);
    }, [orderBookData]);

    if (allPrices.length === 0) return null;

    // prices to show should always include the mid point price
    const pricesToShow = shouldShowAllPrices
        ? allPrices
        : allPrices.filter((price) => orderBookPriceMap.has(price) || price === midPointPrice);

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
