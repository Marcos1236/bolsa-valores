import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { StockService } from './observer/stockService';
import { ObserverImpl } from './observer/observerImpl';  // Asegúrate de importar correctamente tus clases

const app = express();
const server = http.createServer(app);

// Interfaz para el cuerpo de la solicitud de actualización de stock
interface StockRequestBody {
    symbol: string;
    price: number;
}

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
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

// Conexión de WebSocket
io.on('connection', (socket: Socket) => {
    socket.emit('welcome', { message: 'Welcome to the stock server!' });

    // Evento para suscribirse a una acción
    socket.on('subscribe', (stockSymbol: string) => {
        const observer = new ObserverImpl(socket, stockService); // Creamos un observador
        const subscribed = stockService.attach(stockSymbol, observer); 
        if(subscribed) {
            socket.emit('subscribe-allowed')
        }       
    });
});

// Endpoint para obtener las acciones disponibles
app.get('/stocks', async (req: Request, res: Response) => {
    const availableStocks = stockService.getStocks();
    res.json(availableStocks);
});

// Endpoint para actualizar el precio de una acción
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

// Iniciar el servidor
server.listen(3000, () => console.log('Server running on port 3000'));