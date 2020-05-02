

export class Constants {
    private static readonly sectionCommentPaddingText = 'RESJSONSECTIONCOMMENT';
    private static readonly itemCommentPaddingText = 'RESJSONITEMCOMMENT';

    public static get sectionCommentPaddingTextHex() {
        return new Buffer(Constants.sectionCommentPaddingText).toString('hex');
    }

    public static get itemCommentPaddingTextHex() {
        return new Buffer(Constants.itemCommentPaddingText).toString('hex');
    }

    public static readonly randomNumberFloor = 0;
    public static readonly randomNumberCeil = 10000;
}

export class Regexes {
    public static readonly lineCommentKeyRegex = /(?<=")\/\/(?="\s*:\s*".*",?\n?)/gm;
    public static readonly noneCommentKeyRegex = /(?<=")[^_(\/\/)].+(?=":\s*".*",?\n?)/;
    public static readonly itemCommentKey = /(?<=")_.*(?=\.comment"\s*:.*",?$\n?)/m;
    public static readonly closingBracketsPatter = /(?<="):(?=["{])/gm;
    public static readonly objectEndComma = /(?<=}),/gm;
    public static readonly objectEndCurlyBracelet = /(?<!".*)}(?!.*")/;
    public static readonly objectStartCurlyBracelet = /{(?!(.*"))/;

    public static get paddedItemCommentKeyStart() {
        return new RegExp(`^${Constants.itemCommentPaddingTextHex}\\d+/`);
    }
    public static get paddedItemCommentKey() {
        return new RegExp(`(?<=").*${Constants.itemCommentPaddingTextHex}\\d+(?=.*.comment"\\s*:\\s*".*",?\\n?)`, 'gm');
    }
    public static get paddedSectionCommentPattern() {
        return new RegExp(`(?<=").*${Constants.sectionCommentPaddingTextHex}\\d+`, 'gm');
    }
    public static get paddedSectionCommentKeyStart() {
        return new RegExp(`^${Constants.sectionCommentPaddingTextHex}\\d+$`);
    }
    public static get keySeparatorPattern() {
        return /_?([^_\[\]]+)|\[(\d+)\]/g;
    }

}

export class Strings {
    public static readonly commandLabels = {
        expand: 'RESJSON: Expand by underscore(_)',
        flatten: 'RESJSON: Flatten by underscore(_)'
    };
    public static readonly expandCommandNotSupported = `Command ${Strings.commandLabels.expand} will only work with a .resjson file`;
    public static readonly flattenCommandNotSupported = `Command ${Strings.commandLabels.flatten} will only work with a .resjson file`;
    public static readonly ensureFormatting = 'Ensure file is formatted correctly!';
    public static readonly somethingWentWrongExpanding = `Command ${Strings.commandLabels.expand} -> Something went wrong! ${Strings.ensureFormatting}`;
    public static readonly somethingWentWrongFlattening = `Command ${Strings.commandLabels.flatten} -> Something went wrong! ${Strings.ensureFormatting}`;
    public static readonly errorParsing = `Something went  wrong while parsing file. ${Strings.ensureFormatting}`;
}
