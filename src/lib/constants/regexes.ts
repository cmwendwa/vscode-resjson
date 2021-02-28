import { Constants } from './general';

export class Regexes {
    private static get newLinePlaceholderBase() {
        return this.newLinePlaceholderBaseWithoutTerminatingComma + ',?';
    }

    private static get newLinePlaceholderBaseWithoutTerminatingComma() {
        const newLnPlaceholder = Constants.newLinePlaceholderTextHex;
        return `"${newLnPlaceholder}\\d{1,6}"\\s*   :\\s*"${newLnPlaceholder}"`;
    }

    public static readonly lineCommentKeyRegex = /(?<=")\/\/(?="\s*:\s*".*",?)/gm;
    public static readonly noneCommentKeyRegex = /(?!")\w*(?="\s*:)/;
    public static readonly noneCommentKeyRegexGlobal = /(?!")\w*(?="\s*:)/g;

    public static get itemCommentKey() {
        return new RegExp(`(?<=")_[^"]*(?=\\.comment"\\s*:.*",?(${this.newLinePlaceholderBase})?)`, 'gm');
    }

    public static get newlineAtStart() {
        return new RegExp(`^\\s*"\\w*${Constants.newLinePlaceholderTextHex}\\d{1,6}"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",?`, 'gm');
    }

    public static get newlineAtEnd() {
        return new RegExp(`"\\w*${Constants.newLinePlaceholderTextHex}\\d{1,6}"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",?\\s*$`, 'gm');
    }

    public static readonly closingBracketsPattern = /(?<="):(?=["{])/gm;
    public static readonly objectEndCurlyBracelet = /(?<!".*)}(?!.*")/;
    public static readonly objectStartCurlyBracelet = /{(?!(.*"))/;

    public static get newLinePlaceholder() {
        return new RegExp(Regexes.newLinePlaceholderBase, 'gm');
    }

    public static get fullNewLinePlaceholder() {
        const newLnPlaceholder = Constants.newLinePlaceholderTextHex;
        return new RegExp(`"\\w*${newLnPlaceholder}\\d{1,6}"\\s*:\\s*"${newLnPlaceholder}",?`, 'gm');
    }

    public static get newLineAtObjectEnd() {
        return new RegExp(`,${this.newLinePlaceholderBaseWithoutTerminatingComma}(?=})`);
    }

    public static get newLineAtObjectEndOutside() {
        return new RegExp(`(?<=},)${this.newLinePlaceholderBase}}`);
    }

    public static get newLineTrailingComma() {
        return new RegExp(`"\\w*${Constants.newLinePlaceholderTextHex}\\d{1,6}"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",`, 'gm');
    }

    public static get newLinePrecedingComma() {
        return new RegExp(`,?"\\w*${Constants.newLinePlaceholderTextHex}\\d{1,6}"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}"`, 'gm');
    }

    public static get multipleFullNewLinePlaceholder() {
        const newLnPlaceholder = Constants.newLinePlaceholderTextHex;
        return new RegExp(`("\\w*${newLnPlaceholder}\\d{1,6}"\\s*:\\s*"${newLnPlaceholder}",?)*("\\w*${newLnPlaceholder}\\d{1,6}"\\s*:\\s*"${newLnPlaceholder}",?){2,2}`, 'gm');
    }

    public static get objectEndComma() {
        const regexText = `(?<=})\\s*,(${this.newLinePlaceholderBase})*`;
        return new RegExp(regexText, 'gm');
    }

    public static get commaBeforeInlineSelectionComment() {
        const regexText = `(?<!{${this.newLinePlaceholderBaseWithoutTerminatingComma}),(${this.newLinePlaceholderBase})*(?=\\s*"\/\/")`;
        return new RegExp(regexText, 'gm');
    }

    public static get newLinePlaceholderKey() {
        return new RegExp(`^${Constants.newLinePlaceholderTextHex}\\d+`);
    }

    public static get paddedItemCommentKeyStart() {
        return new RegExp(`^${Constants.itemCommentPaddingTextHex}\\d+`);
    }

    public static get paddedItemCommentKey() {
        return new RegExp(`(?<=").*${Constants.itemCommentPaddingTextHex}\\d+(?=.*.comment"\\s*:\\s*".*",?(${this.newLinePlaceholderBase})?)`, 'gm');
    }

    public static get paddedSectionCommentPattern() {
        return new RegExp(`(?<=")\\w*${Constants.sectionCommentPaddingTextHex}\\d+(?=")`, 'gm');
    }

    public static get paddedSectionCommentKeyStart() {
        return new RegExp(`^${Constants.sectionCommentPaddingTextHex}\\d+$`);
    }

    public static get paddedSectionCommentKey() {
        return new RegExp(`\\w*${Constants.sectionCommentPaddingTextHex}\\d+$`);
    }

    public static readonly newLine = /\r?\n|\r/gm;
    public static readonly newLineWithNoNeedForPreceedingComma = /((?<=\s*[{,]\s*)(\r?\n|\r))|((?<=(\r?\n|\r))(\r?\n|\r)(?=}))/gm

    public static get inlinePaddedSectionCommentKeyStart() {
        return RegExp(`(?<!{)("${Constants.newLinePlaceholderTextHex}\\d+":\\s*"${Constants.newLinePlaceholderTextHex}"\\s*,)+(\\s*"\\w*${Constants.sectionCommentPaddingTextHex}\\d+":)`, 'gm');
    }

    public static get keySeparatorPattern() {
        return /_?([^_\[\]]+)|\[(\d+)\]/g;
    }

    public static get indentationBreaksPattern() {
        return new RegExp(`(.*?)("\\w*${Constants.newLinePlaceholderTextHex}\\d+"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",?)`, 'gm');
    }

    public static get contentBeforeObjectEndBracket() {
        return new RegExp(`(?<!{)(?<!"\\w*${Constants.sectionCommentPaddingTextHex}\\d+"\\s*:\\s*"[^"]*"),("${Constants.newLinePlaceholderTextHex}\\d+"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",?)+(\\s*"\\w*"\\s*:\\s*{)`, 'gm');
    }

    public static get contentSurroundingObjectEndBracket() {
        return new RegExp(`("${Constants.newLinePlaceholderTextHex}\\d+"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",?)+(\\s*},)("${Constants.newLinePlaceholderTextHex}\\d+"\\s*:\\s*"${Constants.newLinePlaceholderTextHex}",?)+(\\s +)`, 'gm');
    }
}
