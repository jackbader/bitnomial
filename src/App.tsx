import styles from "./App.module.css";
import PriceLadder from "./components/PriceLadder/PriceLadder";

function App() {
  return (
    <div className={styles.appContainer}>
      <PriceLadder ticker="BTC_USD" />
    </div>
  );
}

export default App;
