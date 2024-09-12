import styles from "./App.module.css";
import PriceLadder from "./components/PriceLadder/PriceLadder";
import useOrderBook from "./hooks/useOrderBook";

function App() {
  const { orderBookData, loading, error } = useOrderBook();

  const shouldShowPriceLadder = !loading && !error && orderBookData;
  const lastTradedPrice = 5000;

  return (
    <div className={styles.container}>
      {shouldShowPriceLadder && (
        <PriceLadder
          lastTradedPrice={lastTradedPrice}
          orderBookData={orderBookData}
        />
      )}
    </div>
  );
}

export default App;
