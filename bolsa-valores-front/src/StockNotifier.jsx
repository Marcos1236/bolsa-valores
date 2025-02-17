import { useState, useEffect, useCallback } from "react";
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  withCredentials: true
});

export default function StockNotifier({ navigateToUpdate }) {
    const [availableStocks, setAvailableStocks] = useState([]);
    const [subscribedStocks, setSubscribedStocks] = useState([]);
    const [user] = useState("user1");

    const fetchStocks = async () => {
        try {
            const response = await fetch("http://localhost:3000/stocks");
            if (!response.ok) throw new Error('Error fetching stocks');
            const data = await response.json();

            return Array.isArray(data)
                ? data
                : Object.entries(data).map(([symbol, stock]) => ({ symbol, ...stock }));
        } catch (error) {
            console.error('Error fetching stocks:', error);
            return [];
        }
    };

    useEffect(() => {
        const updateStocks = async () => {
            setAvailableStocks(await fetchStocks());
        };

        updateStocks();
    }, []);

    useEffect(() => {
        const handleUpdate = (data) => {
            setSubscribedStocks((prevStocks) =>
                prevStocks.map((stock) =>
                    stock.symbol === data.symbol ? { ...stock, price: data.price } : stock
                )
            );
            
        };

        socket.on('update', handleUpdate);
        return () => socket.off('update', handleUpdate);
    }, []);

    const handleSubscribe = useCallback(async (stockSymbol) => {
        socket.emit('subscribe', stockSymbol);

        const updateSubscription = async () => {
            const stocksArray = await fetchStocks();
            const updatedStock = stocksArray.find((s) => s.symbol === stockSymbol);
            if (updatedStock) {
                setSubscribedStocks((prevStocks) => {
                    return [...prevStocks.filter((stock) => stock.symbol !== stockSymbol), updatedStock];
                });
            }
        };

        socket.once('subscribe-allowed', updateSubscription);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-900 to-indigo-900 p-6 font-sans overflow-auto">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8 relative">
                    <h1 className="text-4xl font-bold text-white">Bolsa de valores</h1>
                    <p className="text-gray-300">Mantente actualizado con precios de acciones en tiempo real</p>
                    <button 
                        onClick={navigateToUpdate} 
                        className="absolute top-0 right-0 text-sm text-gray-300 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-800 hover:border-gray-800 transition-colors"
                    >
                        Actualizar Precios
                    </button>
                </header>

                <div className="flex flex-wrap space-x-6 gap-6">
                    <section className="flex-1 bg-white rounded-lg shadow-lg p-6 max-h-125 overflow-y-auto">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Acciones disponibles</h2>
                        <ul className="space-y-2">
                            {availableStocks && availableStocks.length > 0 ? (
                                availableStocks.map((stock, index) => (
                                    <li key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                                        <span className="text-gray-700 font-medium">{stock.symbol}</span>
                                        <button 
                                            onClick={() => handleSubscribe(stock.symbol)} 
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                                        >
                                            Suscribirse
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No hay acciones disponibles</li>
                            )}
                        </ul>
                    </section>
                    <section className="flex-1 bg-white rounded-lg shadow-lg p-6 max-h-125 overflow-y-auto">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Seguimiento de acciones</h2>
                        <ul className="space-y-2">
                            {subscribedStocks.length > 0 ? (
                                subscribedStocks.map((stock) => (
                                    <li key={stock.symbol} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                                        <span className="text-gray-700 font-medium">{stock.symbol}</span>
                                        <span className="text-green-600 font-semibold">${stock.price}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No sigues ninguna acción</li>
                            )}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}