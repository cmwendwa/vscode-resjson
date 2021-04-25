
export interface KeyValue {
    [key: string]: any;
}

export interface IndentOptions {
    useSpaces?: boolean
    tabSize?: number
}

export enum ResJsonCommands {
    Format = 'Format',
    Expand = 'Expand',
    Flatten = 'Flatten'
}

export { FormattingError } from './format-error.';
