import { useState } from "react";
import StockNotifier from "./StockNotifier";
import UpdateStockPrice from "./UpdateStockPrice";

export default function App() {
    const [currentScreen, setCurrentScreen] = useState("notifier");

    const navigateToUpdate = () => setCurrentScreen("update");
    const navigateToNotifier = () => setCurrentScreen("notifier");

    return (
        <>
            {currentScreen === "notifier" && <StockNotifier navigateToUpdate={navigateToUpdate} />}
            {currentScreen === "update" && <UpdateStockPrice navigateToNotifier={navigateToNotifier} />}
        </>
    );
}