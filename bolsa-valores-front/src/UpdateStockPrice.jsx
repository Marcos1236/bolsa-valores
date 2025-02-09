import { useState } from "react";

export default function UpdateStockPrice({ navigateToNotifier }) {
    const [updateSymbol, setUpdateSymbol] = useState("");
    const [updatePrice, setUpdatePrice] = useState("");

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
                <header className="text-center mb-8 relative">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 text-center">
                            <h1 className="text-4xl font-bold text-white">Actualizar Precios</h1>
                            <p className="text-gray-300">Actualiza el precio de las acciones</p>
                        </div>
                        <div className="flex-shrink-0">
                            <button 
                                onClick={navigateToNotifier} 
                                className="ml-4 text-sm text-gray-300 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-800 hover:border-gray-800 transition-colors"
                            >
                                Volver a Notificaciones
                            </button>
                        </div>
                    </div>
                </header>

                <section className="bg-white rounded-lg shadow-lg p-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Actualizar precio de acción</h2>
                    <form onSubmit={handleUpdateStockPrice} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Símbolo de la acción</label>
                            <input 
                                type="text" 
                                value={updateSymbol} 
                                onChange={(e) => setUpdateSymbol(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md text-black"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Nuevo precio</label>
                            <input 
                                type="number" 
                                value={updatePrice} 
                                onChange={(e) => setUpdatePrice(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded-md text-black"
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