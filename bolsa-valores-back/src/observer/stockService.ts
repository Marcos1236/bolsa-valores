import {Subject} from "./subject"
import {Observer} from "./observer"

class StockService implements Subject {
    private observers: Map<string, Observer[]> = new Map();

    private stockData: { [symbol: string]: { price: number } } = {
        "AAPL": { "price": 150 },
        "GOOG": { "price": 2800 },
        "AMZN": { "price": 3400 },
        "TSLA": { "price": 650 },
        "MSFT": { "price": 320 },
        "NFLX": { "price": 400 },
        "META": { "price": 330 },
        "NVDA": { "price": 450 },
        "AMD": { "price": 110 },
        "INTC": { "price": 35 },
        "BABA": { "price": 85 },
        "PYPL": { "price": 75 },
        "UBER": { "price": 45 },
        "DIS": { "price": 90 },
        "KO": { "price": 60 },
        "PEP": { "price": 175 },
        "V": { "price": 230 },
        "MA": { "price": 400 },
        "JPM": { "price": 145 },
        "GS": { "price": 380 }
    }
    ;
    
    attach(symbol: string, observer: Observer): boolean {
        if (!this.observers.has(symbol)) {
            this.observers.set(symbol, []);
        }

        const symbolObservers = this.observers.get(symbol)!;

        if (symbolObservers.some(existingObserver => existingObserver.equals(observer))) {
            return false;
        }

        symbolObservers.push(observer);
        return true;
    }

    dettach(symbol: string, observer: Observer): void {
        const symbolObservers = this.observers.get(symbol);
        if (symbolObservers) {
            const index = symbolObservers.findIndex(existingObserver => existingObserver.equals(observer));
            if (index !== -1) {
                symbolObservers.splice(index, 1); 
            }
        }
    }
    
    notify(symbol: string): void {
        const price = this.stockData[symbol]?.price;
        if (price !== undefined) {
            const symbolObservers = this.observers.get(symbol);
            if (symbolObservers) {
                symbolObservers.forEach(observer => {
                    observer.update(symbol);
                });
            }
        }
    }
    
    setStock(symbol: string, price: number): boolean {
        if (!this.stockData[symbol]) {
            return false; 
        }
        this.stockData[symbol].price = price; 
        this.notify(symbol);
        return true;
    }

    /**
     * Si se pasa un símbolo, se retorna el objeto { symbol, price } correspondiente.
     * Si no se pasa ningún símbolo, se retorna todo el conjunto de stocks.
     */
    getStock(): { [symbol: string]: { price: number } };
    getStock(symbol: string): { symbol: string; price: number } | undefined;
    getStock(symbol?: string): any {
        if (symbol) {
        const data = this.stockData[symbol];
        return data ? { symbol, price: data.price } : undefined;
        }
        return this.stockData;
    }

    removeObserver(obs: Observer): void {
        this.observers.forEach((observers, symbol) => {
            this.observers.set(symbol, observers.filter(observer => !observer.equals(obs)));
        });
    }
}

export {StockService};