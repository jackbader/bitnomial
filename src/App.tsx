import styles from "./App.module.css";
import PriceLadderNew from "./components/PriceLadder/PriceLadderNew";

function App() {
  return (
    <div className={styles.container}>
      <PriceLadderNew ticker="BTC_USD" range={1000} />
    </div>
  );
}

export default App;
