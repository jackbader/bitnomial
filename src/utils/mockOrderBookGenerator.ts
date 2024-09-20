import { OrderBookData, OrderBookEntry } from '../types/orderBook';

export function generateMockOrderBookData(ticker: string, length: number = 2000): OrderBookData {
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    const midPoint = Math.floor(length / 2);

    for (let i = 0; i < length; i++) {
        const size = Math.floor(Math.random() * 100) + 1;

        if (i < midPoint) {
            const price = 50000 - i * 10;
            bids.push({ price, size, isUserOrder: false });
        } else {
            const price = 50010 + (i - midPoint) * 10;
            asks.push({ price, size, isUserOrder: false });
        }
    }

    const orderBookData = {
        bids,
        asks,
        ticker,
        tickerDisplayName: 'BTC/USD',
        lastTradedPrice: 50000,
    };

    return orderBookData;
}
