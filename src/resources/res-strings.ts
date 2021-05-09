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

    public static readonly diagnosticMessages = {
        lineCommentWarning: 'Is this suppossed to be a line comment? As is it is not valid line comment. A valid item comment is in the form: "//": "comment_value"',
        resourceCommentMatchError: 'This comment does not match any resource key in the document',
        resourceCommentWarning: 'Is this suppossed to be a resource comment? As is, it is not valid resource comment. A valid item comment is in the form: "_<key>.comment": "comment_value"',
        resourceKeyExistsError: 'A resource with the same key exist.',
        resourceKeyEmptyError: 'Resource key cannot be empty',
        invalidResourceKey: 'A valid resource entry is expected to be in the format "resource_key": "resource value". It is advisable to stick to alphanumerics and underscores for resource key.',
        missingCommaError: 'Expected line to end with a comma'
    };
}
