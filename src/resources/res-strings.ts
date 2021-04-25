export class Strings {
    public static readonly commandLabels = {
        expand: 'RESJSON: Expand by underscore(_)',
        flatten: 'RESJSON: Flatten by underscore(_)'
    };
    public static readonly expandCommandNotSupported = `Command ${Strings.commandLabels.expand} will only work with a .resjson file`;
    public static readonly flattenCommandNotSupported = `Command ${Strings.commandLabels.flatten} will only work with a .resjson file`;
    private static readonly ensureFormatting = 'Ensure file is formatted correctly!';
    public static readonly somethingWentWrongExpanding = `Command ${Strings.commandLabels.expand} -> Something went wrong! ${Strings.ensureFormatting}`;
    public static readonly somethingWentWrongFlattening = `Command ${Strings.commandLabels.flatten} -> Something went wrong! ${Strings.ensureFormatting}`;
    public static readonly errorParsing = `Something went wrong while parsing file. ${Strings.ensureFormatting}`;
}