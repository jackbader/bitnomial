import { useState } from "react";
import { OrderBookSide, UserOrder } from "../../types/orderBook";

interface PriceLadderSubmitOrderProps {
  addUserOrder: (newUserOrder: UserOrder) => void;
}

const PriceLadderSubmitOrder = (props: PriceLadderSubmitOrderProps) => {
  const { addUserOrder } = props;

  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d+$/.test(value)) {
        setter(value);
      }
    };

  const handleSubmit = (side: OrderBookSide) => {
    const priceValue = parseInt(price);
    const sizeValue = parseInt(size);
    if (isNaN(priceValue) || isNaN(sizeValue)) return;

    addUserOrder({
      side,
      price: priceValue,
      size: sizeValue,
    });
  };

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={price}
        onChange={handleInputChange(setPrice)}
        placeholder="Price"
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={size}
        onChange={handleInputChange(setSize)}
        placeholder="Quantity"
      />
      <button onClick={() => handleSubmit(OrderBookSide.BID)}>Buy</button>
      <button onClick={() => handleSubmit(OrderBookSide.ASK)}>Sell</button>
    </div>
  );
};

export default PriceLadderSubmitOrder;
