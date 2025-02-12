interface Observer {
    update(symbol: string): void;
    equals(other: Observer) : boolean;
}

export {Observer}