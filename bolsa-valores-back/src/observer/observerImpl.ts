import {Observer} from "./observer"
import {StockService} from "./stockService"
class ObserverImpl implements Observer {
    private socket: any;  
    private subject: StockService;
  
    constructor(socket: any, subject: StockService) {
      this.socket = socket;
      this.subject = subject;
    }
  
    update(): void {
        const data = this.subject.getStocks();
        const formattedData = Object.entries(data).map(([symbol, details]) => ({
            symbol,
            price: details.price
        }));
        this.socket.emit('update', formattedData);
    }

    equals(other: ObserverImpl): boolean {
        return other instanceof ObserverImpl && this.socket === other.socket;
    }
  }
  
  export {ObserverImpl};