import { OrderBookData } from '../../types/orderBook';
import { aggregateOrderBookEntries } from './priceLadderUtils';

describe('priceLadderUtils', () => {
    describe('aggregateOrderBookEntries', () => {
        it('should aggregate order book entries correctly', () => {
            const orderBookData: OrderBookData = {
                bids: [
                    { price: 100, size: 10, isUserOrder: false },
                    { price: 100, size: 5, isUserOrder: true },
                    { price: 99, size: 15, isUserOrder: false },
                ],
                asks: [
                    { price: 101, size: 8, isUserOrder: false },
                    { price: 101, size: 2, isUserOrder: true },
                    { price: 102, size: 12, isUserOrder: false },
                ],
                lastTradedPrice: 100,
                ticker: 'BTCUSDT',
                tickerDisplayName: 'BTC/USDT',
            };

            const result = aggregateOrderBookEntries(orderBookData);

            expect(result.get(100)).toEqual({
                totalBidsSize: 15,
                totalAsksSize: 0,
                totalUserBids: 5,
                totalUserAsks: 0,
            });
            expect(result.get(99)).toEqual({
                totalBidsSize: 15,
                totalAsksSize: 0,
                totalUserBids: 0,
                totalUserAsks: 0,
            });
            expect(result.get(101)).toEqual({
                totalBidsSize: 0,
                totalAsksSize: 10,
                totalUserBids: 0,
                totalUserAsks: 2,
            });
            expect(result.get(102)).toEqual({
                totalBidsSize: 0,
                totalAsksSize: 12,
                totalUserBids: 0,
                totalUserAsks: 0,
            });
        });
    });
});
