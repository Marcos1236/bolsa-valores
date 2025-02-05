interface Observer {
    update(): void;
    equals(other: Observer) : boolean;
}

export {Observer}