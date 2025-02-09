import { useState, useEffect, useCallback } from "react";
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  withCredentials: true
});

export default function StockNotifier() {
    const [availableStocks, setAvailableStocks] = useState([]);
    const [subscribedStocks, setSubscribedStocks] = useState([]);
    const [user] = useState("user1");
    const [updateSymbol, setUpdateSymbol] = useState("");
    const [updatePrice, setUpdatePrice] = useState("");

    // Función optimizada para obtener datos
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

    // Cargar acciones disponibles
    useEffect(() => {
        const updateStocks = async () => {
            setAvailableStocks(await fetchStocks());
        };

        updateStocks();
    }, []);

    // Manejo eficiente de actualizaciones de precios
    useEffect(() => {
          const handleUpdate = (data) => {
            setSubscribedStocks((prevStocks) =>
                prevStocks.map((stock) => {
                    const updatedStock = data.find((item) => item.symbol === stock.symbol);
                    return updatedStock ? { ...stock, price: updatedStock.price } : stock;
                })
            );
        };
    

        socket.on('update', handleUpdate);
        return () => socket.off('update', handleUpdate);
    }, []);

    // Función optimizada para manejar la suscripción
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

    // Función para manejar la actualización del precio de una acción
    const handleUpdateStockPrice = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/update-stock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ symbol: updateSymbol, price: parseFloat(updatePrice) })
            });
            if (!response.ok) throw new Error('Error updating stock price');
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error updating stock price:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-900 to-indigo-900 p-6 font-sans overflow-auto">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Bolsa de valores</h1>
                    <p className="text-gray-300">Mantente actualizado con precios de acciones en tiempo real</p>
                </header>

                {/* Main Content */}
                <div className="flex flex-wrap space-x-6 gap-6">
                    {/* Available Stocks Section */}
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
                    {/* Subscribed Stocks Section */}
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

                {/* Update Stock Price Section */}
                <section className="bg-white rounded-lg shadow-lg p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Actualizar precio de acción</h2>
                    <form onSubmit={handleUpdateStockPrice} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Símbolo de la acción</label>
                            <input 
                                type="text" 
                                value={updateSymbol} 
                                onChange={(e) => setUpdateSymbol(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Nuevo precio</label>
                            <input 
                                type="number" 
                                value={updatePrice} 
                                onChange={(e) => setUpdatePrice(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Actualizar precio
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
