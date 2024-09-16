import { OrderBookSide, UserOrder } from "../../types/orderBook";
import Button from "../common/Button";
import styles from "./PriceLadderSubmitOrder.module.css";

interface PriceLadderSubmitOrderProps {
  price: string;
  size: string;
  setPrice: React.Dispatch<React.SetStateAction<string>>;
  setSize: React.Dispatch<React.SetStateAction<string>>;
  priceInputRef: React.RefObject<HTMLInputElement>;
  sizeInputRef: React.RefObject<HTMLInputElement>;
  addUserOrder: (order: UserOrder) => void;
}

const PriceLadderSubmitOrder = (props: PriceLadderSubmitOrderProps) => {
  const {
    price,
    size,
    setPrice,
    setSize,
    priceInputRef,
    sizeInputRef,
    addUserOrder,
  } = props;

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
    setPrice("");
    setSize("");
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={price}
        onChange={handleInputChange(setPrice)}
        placeholder="Price"
        ref={priceInputRef}
        className={styles.input}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={size}
        onChange={handleInputChange(setSize)}
        placeholder="Quantity"
        ref={sizeInputRef}
        className={styles.input}
      />
      <div className={styles.buttonContainer}>
        <Button onClick={() => handleSubmit(OrderBookSide.BID)}>Buy</Button>
        <Button onClick={() => handleSubmit(OrderBookSide.ASK)} variant="red">
          Sell
        </Button>
      </div>
    </div>
  );
};

export default PriceLadderSubmitOrder;
