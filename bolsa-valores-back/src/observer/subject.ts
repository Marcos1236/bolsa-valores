import {Observer} from "./observer"
interface Subject {
    attach(symbol: string, observer: Observer): boolean;
    dettach(symbol: string, observer: Observer): void;
    notify(stockSymbol: string): void;
}

export {Subject}