import {Observer} from "./observer"
import {StockService} from "./stockService"
class ObserverImpl implements Observer {
    private socket: any;  
    private subject: StockService;
  
    constructor(socket: any, subject: StockService) {
      this.socket = socket;
      this.subject = subject;
    }
  
    update(symbol: string): void {
        const data = this.subject.getStock(symbol);
        if(data) {
            this.socket.emit('update', data);
        }
    }

    equals(other: ObserverImpl): boolean {
        return other instanceof ObserverImpl && this.socket === other.socket;
    }
  }
  
  export {ObserverImpl};