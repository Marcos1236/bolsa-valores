import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StockNotifier from './App';
import UpdateStockPrice from './UpdateStockPrice';

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StockNotifier />} />
                <Route path="/update-stock-price" element={<UpdateStockPrice />} />
            </Routes>
        </Router>
    );
}