export enum DiagnosticCodes {
    LineCommentWarning,
    ResourceCommentMatchError,
    ResouceCommentWarning,
    ResourceKeyExistsError,
    ResourceKeyIsEmptyError,
    InvalidResouceKey,
    MissingCommaError,
    TrailingCommaError,
    MissingResourceComment
}

export class Constants {
    private static readonly sectionCommentPaddingText = 'RESJSONSECTIONCOMMENT';
    private static readonly itemCommentPaddingText = 'RESJSONITEMCOMMENT';
    private static readonly newLinePlaceHolderText = 'RESJSONNEWLINE';

    public static get sectionCommentPaddingTextHex() {
        const s = Buffer.from(Constants.sectionCommentPaddingText).toString('hex');
        return s;
    }
    public static get itemCommentPaddingTextHex() {
        return Buffer.from(Constants.itemCommentPaddingText).toString('hex');
    }
    public static readonly newLinePlaceholderTextHex = Buffer.from(Constants.newLinePlaceHolderText).toString('hex').toString();
    public static readonly randomNumberFloor = 0;
    public static readonly randomNumberCeil = 10000;

    public static readonly actionableDiagnostics = [
        DiagnosticCodes.ResourceKeyExistsError,
        DiagnosticCodes.MissingCommaError,
        DiagnosticCodes.TrailingCommaError,,,
        DiagnosticCodes.MissingResourceComment
    ]
}
