import { Regexes } from "../constants/regexes";
import { Constants } from '../constants/general';
import { IndentationOptions, FormattingError } from "../models";
import { strict } from "assert";
import * as vscode from "vscode";

export class Formatting {
    /**
     * @param content text to fromat
     * @returns Formatted text
     */
    public static format(content: string): string {
        const withoutExtraNewlines = this.removeExtraNewLines(content);
        const withNewlinePlaceHoldersAndPaddings = this.replaceNewLinesWithPlaceHolders(withoutExtraNewlines);
        const withoutWhiteSpaces = this.removeDanglingWhiteSpaces(withNewlinePlaceHoldersAndPaddings);
        const withNewlines = this.addNewLines(withoutWhiteSpaces);

        const inDentationOptions: IndentationOptions = {};
        if (vscode.window.activeTextEditor) {
            inDentationOptions.useSpaces = !!vscode.window.activeTextEditor.options.insertSpaces;
            inDentationOptions.tabSize = Number(vscode.window.activeTextEditor.options.tabSize);
        }
        const withIndetation = this.indent(withNewlines, inDentationOptions);

        const withColonFormatting = this.addAndStripSpaceAroundColon(withIndetation);
        const withExtraNewlineBeforeSectionComment = this.addNewLineBeforeInlineSectionComments(withColonFormatting);

        const cleaned = this.removePlaceholders(withExtraNewlineBeforeSectionComment);
        return cleaned;
    }

    /**
     * Adds new lines as necessary
     * @param str string to be formatted
     */
    public static addNewLines(str: string): string {
        const punctuationStack = new Array();
        let processed = "";

        for (let i = 0; i < str.length; i++) {
            if (i === strict.length - 1) {
                processed += str[i];
                break;
            }
            const top = punctuationStack[punctuationStack.length - 1];
            const escaped = str[i - 1] === '\\';
            if (escaped) {
                processed += str[i];
                continue;
            }

            if (top === '"') {
                if (top === str[i]) {
                    punctuationStack.pop();
                }
                processed += str[i];
                continue;
            }

            const punctuations = [',', '{', '}', '[', ']'];

            const unProcessed = str.substr(i + 1);
            const appendNewLine = punctuations.includes(str[i]) && this.shouldAppendNewLine(processed, unProcessed);

            // console.log('IIII iii', i, '--->', str[i]);

            switch (str[i]) {
                case '"':
                    punctuationStack.push(str[i]);
                    processed += str[i];
                    break;
                case ',':
                    processed += str[i]
                    if (appendNewLine) {
                        processed += this.randomNewLinePlaceholder;
                    }
                    break;
                case '{':
                    punctuationStack.push(str[i]);
                    if (appendNewLine) {
                        processed += str[i] + this.randomNewLinePlaceholder;
                    } else {
                        processed += str[i];
                    }
                    break;
                case '[':
                    punctuationStack.push(str[i]);
                    processed += str[i];
                    if (appendNewLine) {
                        processed += this.randomNewLinePlaceholder;
                    }
                    break;
                case '}':
                    if (top === '{') {
                        punctuationStack.pop();
                        if (this.shouldPrependNewLine(processed)) {
                            // console.log('********* APPEND NEW LINE', processed, '--->', unProcessed);
                            const addComma = str[i - 1] === ',' ? '' : ',';
                            processed += addComma + this.randomNewLinePlaceholder.slice(0, -1) + str[i];
                        } else {
                            // console.log('********* NO APPEND NEW LINE', processed, '--->', unProcessed);
                            processed += str[i];
                        }
                    }
                    break;
                case ']':
                    if (top === '[') {
                        punctuationStack.pop();
                        if (appendNewLine) {
                            processed += this.randomNewLinePlaceholder.slice(0, -1) + str[i];
                        } else {
                            processed += str[i];
                        }
                    }
                    break;
                default:
                    processed += str[i];
            }
        }

        if (punctuationStack.length > 0) {
            throw new FormattingError();
        }
        return processed;
    }

    /**
     * Returns true if given string does not end or start with a newline
     * @param str
     */
    private static shouldAppendNewLine(processed: string, unProcessed: string): boolean {
        return !Regexes.newlineAtEnd.test(processed) && !Regexes.newlineAtStart.test(unProcessed);
    }

    /**
     * Returns true if given string does not end or start with a newline
     * @param str Return
     */
    private static shouldPrependNewLine(processed: string): boolean {
        return !Regexes.newlineAtEnd.test(processed);
    }

    /**
     * Formats by adding indentation
     * @param str the lines to be formatted
     * @param insertSpaces whether to use spaces or tab s
     * @param tabSize size of tab in no of spaces
     */
    private static indent(str: string, options?: IndentationOptions): string {
        const indentChar = options?.useSpaces ? " " : "\t";
        let tabs = 0;
        let s = str.replace(Regexes.indentationBreaksPattern, (match, g1, g2, index) => {
            let line;

            console.log("Gss", g1, g2)
            if (g1 === '') {
                // No need to indent empty lines
                return g1 + g2;
            }

            if (g1.match(/}(?=([^"]*"[^"]*")*[^"]*$)/)) {
                // decrease tabs on closing an object
                tabs -= 1;
            }
            if (options?.useSpaces) {
                const spaces = tabs * (options.tabSize || 2);
                line = indentChar.repeat(spaces) + g1 + g2;
            } else {
                line = indentChar.repeat(tabs) + g1 + g2;
            }

            if (g1.match(/{(?=([^"]*"[^"]*")*[^"]*$)/)) {
                // increase tabs on opening a new object
                tabs += 1;
            }

            return line;
        });
        return s;
    }

    /**
     * Replaces newlines and comments in the content with placeholders
     * This is done to ensure they are not lost during processing
     * @param content
     */
    public static addPlaceholders(content: string) {
        const withNewLinePlaceholders = this.replaceNewLinesWithPlaceHolders(content.trim());
        const withCommentPlaceholders = this.replaceCommentsWithPlacholders(withNewLinePlaceholders);
        return withCommentPlaceholders.replace(/(,)(\s*})(?=([^"]*"[^"]*")*[^"]*$)/gm, '$2');
    }

    /**
     * Pads both section and item comments
     * This ensures duplicate comments are not lost and there's a way to ignore comments
     * @param content to be padded
     */
    private static replaceCommentsWithPlacholders(content: string): string {
        const withItemCommentPadding = this.padItemComments(content);
        const withLineKeyPlaceholders = this.replaceSectionCommentKeysWithPlaceholders(withItemCommentPadding);
        return withLineKeyPlaceholders;
    }

    /**
     * Removes the comment placeholders added before processing
     * @param content to be un-padded
     */
    private static removeCommentPlaceHolders(content: string): string {
        const withoutLineCommentPadding = this.removeLineCommentPlaceholders(content);
        const withoutItemCommentPadding = this.removeItemCommentPadding(withoutLineCommentPadding);
        return withoutItemCommentPadding;
    }

    /**
     * Remove newline and comment placeholders
     * @param content
     */
    private static removePlaceholders(content: string) {
        const withoutNewLinePlaceholders = this.removeNewLinePlaceHolders(content);
        const withoutCommentPlaceholders = this.removeCommentPlaceHolders(withoutNewLinePlaceholders);
        return withoutCommentPlaceholders;
    }

    /**
     * Returns a JSON entry for a newline placeholder
     */
    private static get randomNewLinePlaceholder() {
        return `"${Constants.newLinePlaceholderTextHex}${this.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}": "${Constants.newLinePlaceholderTextHex}",`;
    }

    /**
     * Remove all white spaces that are not part of a value
     * @param content to be processed
     */
    private static removeDanglingWhiteSpaces(content: string) {
        return content.replace(/\s(?=([^"]*"[^"]*")*[^"]*$)/gm, '');
    }

    /**
     * Ensures there's only one space to the right of the colon and none to the left
     * @param content
     */
    private static addAndStripSpaceAroundColon(content: string): string {
        return content.replace(Regexes.closingBracketsPattern, ': ');
    }

    /**
     * Adds a newline before resjson section comments ("//": "comment content")
     * @param content
     */
    private static addNewLineBeforeInlineSectionComments(content: string): string {
        return content.replace(Regexes.inlinePaddedSectionCommentKeyStart, (match, group1, group2, index) => {
            return `${this.randomNewLinePlaceholder}${this.randomNewLinePlaceholder}${group2}`;
        });
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

            const split = nextNoneCommentKey && nextNoneCommentKey.split('_');
            if (split && split.length > 1) {
                prefix = split.length > 1 ? split.slice(0, -1).join('_') : split[0];
                prefix += '_';
            }
            return `${prefix}${Constants.sectionCommentPaddingTextHex}${this.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}`;
        });
        return result;
    }

    /**
     * Remove line comment placeholders
     */
    private static removeLineCommentPlaceholders(str: string): string {
        const parsed = str.replace(Regexes.paddedSectionCommentPattern, '//');
        return parsed;
    }

    /**
     *  Add paceholders to item comments, they look like "//": "comment content"
     */
    private static padItemComments(content: string): string {
        let paddedContent = content;
        paddedContent = paddedContent.replace(Regexes.itemCommentKey, (match, _) => {
            const newStartDelimiter = `${Constants.itemCommentPaddingTextHex}${this.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}`;
            const commentedItem = match.substr(1);
            const itemParent = commentedItem.split('_').slice(0, -1).join('_');
            const output = `${itemParent}_${newStartDelimiter}${match}`;
            return output;
        });
        return paddedContent;
    }

    /**
     * Remove item comment placehoders, they look like: "_sampe_item.comment": "comment content" (i.e. key starts with an underscore and ends with .comment)
     */
    private static removeItemCommentPadding(content: string): string {
        return content.replace(Regexes.paddedItemCommentKey, '');
    }

    /**
     * Get a random number
     * @param min number should not be less than this
     * @param max number should not be greater than this
     */
    private static getRandomNumber(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Replace new lines with placehoder JSON entry for new lines
     * @param content
     */
    private static replaceNewLinesWithPlaceHolders(content: string) {
        return content
            .replace(Regexes.newLineWithNoNeedForPreceedingComma, this.randomNewLinePlaceholder)
            .replace(Regexes.newLine, ',' + this.randomNewLinePlaceholder);
    }

    /**
     * Replace new line placeholders with actual new lines
     * @param content
     */
    private static removeNewLinePlaceHolders(content: string,) {
        return content
            .replace(Regexes.newLineTrailingComma, '\n')
            .replace(Regexes.newLinePrecedingComma, '\n')
            .replace(/,(\s*})(?=([^"]*"[^"]*")*[^"]*$)/gm, '$1');
    }

    /**
     * Truncate empty spaces to only a maximum of two consecutive newlines
     * Also:
     *  - Remove spaces before '}' and after '{'
     * @param content
     */
    private static removeExtraNewLines(content: string) {
        return content
            .replace(/\s*}/gm, '}')
            .replace(/{\s*/gm, '{')
            .replace(/\n{2,}/gm, '\n\n');
    }
}