import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { StockService } from './observer/stockService';
import { ObserverImpl } from './observer/observerImpl';  

const app = express();
const server = http.createServer(app);

interface StockRequestBody {
    symbol: string;
    price: number;
}

app.use(express.json());

// Configuración de CORS
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

// Configuración de Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

// Instancia del servicio de stocks
const stockService = new StockService();


io.on('connection', (socket: Socket) => {
    socket.emit('welcome', { message: 'Welcome to the stock server!' });

    socket.on('subscribe', (stockSymbol: string) => {
        const observer = new ObserverImpl(socket, stockService); 
        const subscribed = stockService.attach(stockSymbol, observer); 
        if(subscribed) {
            socket.emit('subscribe-allowed')
        }       
    });
});

app.get('/stocks', async (req: Request, res: Response) => {
    const availableStocks = stockService.getStock();
    res.json(availableStocks);
});

app.post('/update-stock', (req: Request<{}, {}, StockRequestBody>, res: Response) => {
    const { symbol, price } = req.body;

    if (!symbol || !price) {
        res.status(400).json({ message: 'Symbol and price are required' });
    }

    const isUpdated = stockService.setStock(symbol, price);

    if (isUpdated) {
        stockService.notify(symbol);
        res.json({ message: `Price of ${symbol} updated to $${price}` });
    } else {
        res.status(404).json({ message: `Stock symbol ${symbol} not found` });
    }
});

server.listen(3000, () => console.log('Server running on port 3000'));