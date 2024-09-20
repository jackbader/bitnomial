import React from 'react';
import classNames from 'classnames';
import styles from './PriceLadderRow.module.css';
import { OrderBookPriceMapEntry } from '../../types/orderBook';

interface PriceLadderRowProps {
    price: number;
    item: OrderBookPriceMapEntry | undefined;
    isSelected: boolean;
    isMidPointPrice: boolean;
    onClick: (price: number) => void;
    style: React.CSSProperties;
}

const PriceLadderRow: React.FC<PriceLadderRowProps> = ({
    price,
    item,
    isSelected,
    isMidPointPrice,
    onClick,
    style,
}) => {
    const rowClassName = classNames(styles.row, {
        [styles.midPointPriceRow]: isMidPointPrice,
        [styles.selectedRow]: isSelected,
    });

    const totalBidsSize = item?.totalBidsSize ?? 0;
    const totalUserBids = item?.totalUserBids ?? 0;
    const totalAsksSize = item?.totalAsksSize ?? 0;
    const totalUserAsks = item?.totalUserAsks ?? 0;

    const hasBids = totalBidsSize > 0;
    const hasUserBids = totalUserBids > 0;
    const hasAsks = totalAsksSize > 0;
    const hasUserAsks = totalUserAsks > 0;

    const bidClassName = classNames(styles.rowText, {
        [styles.bidRowText]: hasBids,
    });

    const askClassName = classNames(styles.rowText, {
        [styles.askRowText]: hasAsks,
    });

    return (
        <div className={rowClassName} style={style} onClick={() => onClick(price)}>
            <div className={bidClassName}>
                {hasBids ? totalBidsSize : ''}
                {hasUserBids && <span className={styles.userOrderSize}>({totalUserBids})</span>}
            </div>
            <div className={classNames(styles.rowText, styles.centerRowText)}>{price}</div>
            <div className={askClassName}>
                {hasAsks ? totalAsksSize : ''}
                {hasUserAsks && <span className={styles.userOrderSize}>({totalUserAsks})</span>}
            </div>
        </div>
    );
};

export default PriceLadderRow;
