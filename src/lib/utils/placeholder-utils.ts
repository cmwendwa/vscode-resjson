import { Constants } from "../constants/general";
import { Regexes } from "../constants/regexes";

export class PlaceHolderUtils {
    /**
     * Returns a JSON entry for a newline placeholder
     */
    public static get randomNewLinePlaceholder() {
        return `"${Constants.newLinePlaceholderTextHex}${this.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}": "${Constants.newLinePlaceholderTextHex}",`;
    }

    /**
     * Get a random number
     * @param min number should not be less than this
     * @param max number should not be greater than this
     */
    public static getRandomNumber(min: number = Constants.randomNumberFloor, max: number = Constants.randomNumberCeil): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Replaces newlines and comments in the content with placeholders
     * This is done to ensure they are not lost during processing
     */
    public static addPlaceholders(str: string): string {
        const withNewlinePlaceHolders = this.replaceNewLinesWithPlaceHolders(str);
        return this.replaceCommentsWithPlacholders(withNewlinePlaceHolders).replace(/(,)(\s*})(?=([^"]*"[^"]*")*[^"]*$)/gm, '$2');
    }

    /**
     * Replace new lines with placehoder JSON entry for new lines
     */
    public static replaceNewLinesWithPlaceHolders(str: string): string {
        return str
            .replace(Regexes.newLineWithNoNeedForPreceedingComma, this.randomNewLinePlaceholder)
            .replace(Regexes.newLine, ',' + this.randomNewLinePlaceholder);
    }

    /**
     * Pads both section and item comments
     * This ensures duplicate comments are not lost and there's a way to ignore comments
     */
    private static replaceCommentsWithPlacholders(str: string): string {
        const withPadding = this.padItemComments(str);
        return this.replaceSectionCommentKeysWithPlaceholders(withPadding);
    }

    /**
     * Remove item comment placehoders, they look like: "_sampe_item.comment": "comment content" (i.e. key starts with an underscore and ends with .comment)
     */
    public static removeItemCommentPadding(str: string): string {
        return str.replace(Regexes.paddedItemCommentKey, '');
    }

    /**
     * Replace new line placeholders with actual new lines
     */
    public static removeNewLinePlaceHolders(str: string): string {
        return str.replace(Regexes.newLineTrailingComma, '\n')
            .replace(Regexes.newLinePrecedingComma, '\n')
            .replace(/,(\s*})(?=([^"]*"[^"]*")*[^"]*$)/gm, '$1');
    }

    /**
     * Remove newline and comment placeholders
     */
    public static removePlaceholders(str: string): string {
        const withoutNewLinePlaceHolders = this.removeNewLinePlaceHolders(str);
        return this.removeCommentPlaceHolders(withoutNewLinePlaceHolders);
    }

    /**
     * Removes the comment placeholders added before processing
     */
    private static removeCommentPlaceHolders(str: string): string {
        const withoutLineCommentPlaceHolders = this.removeLineCommentPlaceholders(str);
        return this.removeItemCommentPadding(withoutLineCommentPlaceHolders);
    }

    /**
     *  Add paceholders to item comments, they look like "//": "comment content"
     */
    public static padItemComments(str: string): string {
        let paddedContent = str;
        paddedContent = paddedContent.replace(Regexes.itemCommentKey, (match, _) => {
            const newStartDelimiter = `${Constants.itemCommentPaddingTextHex}${this.getRandomNumber()}`;
            const commentedItem = match.substr(1);
            const itemParent = commentedItem.split('_').slice(0, -1).join('_');
            const output = `${itemParent}_${newStartDelimiter}${match}`;
            return output;
        });
        return paddedContent;
    }

    /**
     * Use placeholders for line comments so that they are not lost when flattening/expanding
     */
    private static replaceSectionCommentKeysWithPlaceholders(str: string): string {
        const result = str.replace(Regexes.lineCommentKeyRegex, (match, index) => {
            let prefix = '';
            const restOfString = str.substr(index + match.length + 1);
            const executionResults = Regexes.noneCommentKeyRegex.exec(restOfString);
            const nextNoneCommentKey = executionResults && executionResults[0];

            const parts = nextNoneCommentKey?.split('_');
            if (parts && parts.length > 1) {
                prefix = parts.length > 1 ? parts.slice(0, -1).join('_') : parts[0];
                prefix += '_';
            }
            return `${prefix}${Constants.sectionCommentPaddingTextHex}${this.getRandomNumber()}`;
        });

        return result;
    }

    /**
     * Remove line comment placeholders
     */
    private static removeLineCommentPlaceholders(str: string): string {
        return str.replace(Regexes.paddedSectionCommentPattern, '//');
    }
}
