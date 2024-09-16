export enum OrderBookSide {
  BID = "bid",
  ASK = "ask",
}

export interface OrderBookEntry {
  price: number;
  size: number;
  isUserOrder: boolean;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastTradedPrice: number;
}

export interface UserOrder {
  price: number;
  size: number;
  side: OrderBookSide;
}
