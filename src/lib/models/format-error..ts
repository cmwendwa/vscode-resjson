export class FormattingError extends Error {
    constructor() {
        super('Formatting Error');
        Object.setPrototypeOf(this, FormattingError.prototype);
    }
}
