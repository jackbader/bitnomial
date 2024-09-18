import { OrderBookSide, UserOrder } from '../../types/orderBook';
import Button from '../common/Button';
import styles from './PriceLadderSubmitOrder.module.css';
import { useState } from 'react';

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
    const { price, size, setPrice, setSize, priceInputRef, sizeInputRef, addUserOrder } = props;
    const [error, setError] = useState<string | null>(null);

    const handleInputChange =
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (value === '' || /^\d+$/.test(value)) {
                setter(value);
            }
        };

    const handleSubmit = (side: OrderBookSide) => {
        const priceValue = parseInt(price);
        const sizeValue = parseInt(size);

        if (isNaN(priceValue) || isNaN(sizeValue)) {
            setError('Please enter valid numbers for price and quantity.');
            return;
        }

        if (sizeValue <= 0) {
            setError('Quantity must be greater than 0.');
            return;
        }

        setError(null);
        addUserOrder({
            side,
            price: priceValue,
            size: sizeValue,
        });
        setPrice('');
        setSize('');
    };

    return (
        <div className={styles.submitOrderContainer}>
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
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.submitOrderButtons}>
                <Button onClick={() => handleSubmit(OrderBookSide.BID)} variant="buy">
                    Buy
                </Button>
                <Button onClick={() => handleSubmit(OrderBookSide.ASK)} variant="sell">
                    Sell
                </Button>
            </div>
        </div>
    );
};

export default PriceLadderSubmitOrder;
