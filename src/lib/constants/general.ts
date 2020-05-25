export class Constants {
    private static readonly sectionCommentPaddingText = 'RESJSONSECTIONCOMMENT';
    private static readonly itemCommentPaddingText = 'RESJSONITEMCOMMENT';
    private static readonly newLinePlaceHolderText = 'RESJSONNEWLINE';

    public static get sectionCommentPaddingTextHex() {
        const s = new Buffer(Constants.sectionCommentPaddingText).toString('hex');
        return s;
    }
    public static get itemCommentPaddingTextHex() {
        return new Buffer(Constants.itemCommentPaddingText).toString('hex');
    }
    public static get newLinePlaceholderTextHex() {
        const s = this.newLinePlaceHolderText;
        return s;
    }//new Buffer(Constants.newLinePlaceHolderText).toString('hex');

    public static readonly randomNumberFloor = 0;
    public static readonly randomNumberCeil = 10000;
}