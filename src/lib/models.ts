
export interface KeyValue {
    [key: string]: any;
}

export interface IndentationOptions {
    useSpaces?: boolean
    tabSize?: number
}

export class FormattingError extends Error {
    constructor() {
        super('Formatting Error');

        Object.setPrototypeOf(this, FormattingError.prototype);
    }
}