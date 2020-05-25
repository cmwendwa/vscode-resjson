import { Regexes} from "../constants/res-regexes";
import {Constants} from '../constants/general';
import { IndentationOptions, FormattingError } from "../models";
import { strict } from "assert";
import * as vscode from "vscode";

export class Formatting {
    /**
     * @param content text to fromat
     * @returns Formatted text
     */
    public static format(content: string): string {
        const withPlaceHoldersAndPaddings = this.addPlaceholdersAndPaddings(content);
        const withoutWhiteSpaces = this.removeAllWhiteSpacesBetweenLines(withPlaceHoldersAndPaddings);
        const withNewlinesAndSpaces = this.insertNewLinesAndSpaces(withoutWhiteSpaces);

        const inDentationOptions: IndentationOptions = {};
        if (vscode.window.activeTextEditor) {
            inDentationOptions.useSpaces = !!vscode.window.activeTextEditor.options.insertSpaces;
            inDentationOptions.tabSize = Number(vscode.window.activeTextEditor.options.tabSize);
        }
        const withIndetation = this.indent(withNewlinesAndSpaces, inDentationOptions);

        const formattedAroundColons = this.addAndStripSpaceAroundColon(withIndetation);
        const withExtraNewlineAtObjectEnd = this.addNewLineAtEndOfObject(formattedAroundColons);
        const withExtraNewlineBeforeSectionComment = this.addNewLineBeforeInlineSectionComments(withExtraNewlineAtObjectEnd);
        const cleaned = this.removePlaceholdersAndPaddings(withExtraNewlineBeforeSectionComment);

        return cleaned;
    }

    /**
     * Adds new lines as necessary
     * @param str string to be formatted
     */
    public static insertNewLinesAndSpaces(str: string): string {
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

            switch (str[i]) {
                case '"':
                    punctuationStack.push(str[i]);
                    processed += str[i];
                    break;
                case ",":
                    if (Regexes.newlineAtEnd.test(processed)) {
                        processed += str[i];
                        break;
                    }
                    processed += str[i] + this.randomNewLinePlaceholder;
                    break;
                case "{":
                    punctuationStack.push(str[i]);
                    processed += str[i] + this.randomNewLinePlaceholder;
                    break;
                case "[":
                    punctuationStack.push(str[i]);
                    processed += str[i] + this.randomNewLinePlaceholder;
                    break;

                case "}":
                    if (top === '{') {
                        punctuationStack.pop();
                        const addComma = str[i - 1] === ',' ? '' : ',';
                        processed += addComma + this.randomNewLinePlaceholder.slice(0, -1) + str[i];
                        break;
                    }
                    break;
                case "]":
                    if (top === '[') {
                        punctuationStack.pop();
                        processed += this.randomNewLinePlaceholder.slice(0, -1) + str[i];
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
     * Formats by adding indentation
     * @param str the lines to be formatted
     * @param insertSpaces whether to use spaces or tab s
     * @param tabSize size of tab in no of spaces
     */
    public static indent(str: string, options?: IndentationOptions): string {
        const indentChar = options?.useSpaces ? " " : "\t";
        let tabs = 0;
        let s = str.replace(Regexes.indentationBreaksPattern, (match, g1, g2, index) => {
            let line;

            if (g1.match(/}(?=([^"]*"[^"]*")*[^"]*$)/)) {
                // decrease tabs on closing an object
                tabs -= 1;
            }
            tabs;
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

    public static addPlaceholdersAndPaddings(content: string) {
        const withNewLinePlaceholders = this.addNewLinePlaceHolders(content.trimRight());
        const withPaddedComments = this.addCommentPadding(withNewLinePlaceholders);
        return withPaddedComments.replace(/(,)(\s*})(?=([^"]*"[^"]*")*[^"]*$)/gm, '$2');
    }

    /**
     * Pads both section and item comments
     * This ensures duplicate comments are not lost and there's a way to ignore comments
     * @param content to be padded
     */
    private static addCommentPadding(content: string): string {
        const withItemCommentPadding = this.padItemComments(content);
        const withLineCommentPadding = this.padSectionCommentKeys(withItemCommentPadding);
        return withLineCommentPadding;
    }

    /**
     * Removes the comments added before processing
     * @param content to be un-padded
     */
    private static removeCommentPadding(content: string): string {
        const withoutLineCommentPadding = this.removeLineCommentsPadding(content);
        const withoutItemCommentPadding = this.removeItemCommentPadding(withoutLineCommentPadding);
        return withoutItemCommentPadding;
    }

    private static removePlaceholdersAndPaddings(content: string) {
        const withoutNewLinePlaceholders = this.removeNewLinePlaceHolders(content);
        const withoutPaddedComments = this.removeCommentPadding(withoutNewLinePlaceholders);
        const withoutWhiteSpaceLines = this.removeWhiteSpaceLines(withoutPaddedComments);
        return withoutWhiteSpaceLines;
    }
    
    private static get randomNewLinePlaceholder() {
        return `"${Constants.newLinePlaceholderTextHex}${this.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}": "${Constants.newLinePlaceholderTextHex}",`;
    }

    private static removeAllWhiteSpacesBetweenLines(content: string) {
        return content.replace(/\s(?=([^"]*"[^"]*")*[^"]*$)/gm, '');
    }

    private static addAndStripSpaceAroundColon(content: string): string {
        return content.replace(Regexes.closingBracketsPattern, ': ');
    }

    private static addNewLineAtEndOfObject(content: string): string {
        content = content.replace(Regexes.contentBeforeObjectEndBracket, `,${this.randomNewLinePlaceholder}${this.randomNewLinePlaceholder}$2`);
        return content.replace(Regexes.contentSurroundingObjectEndBracket, (match, group1, group2, group3, group4, index) => {
            let nextCharacter;
            const nextCharacterIndex = index + match.length;
            if (nextCharacterIndex <= content.length - 1) {
                nextCharacter = content[nextCharacterIndex];
                if (nextCharacter === '}') {
                    return `${this.randomNewLinePlaceholder}${group2.slice(0, -1)}${this.randomNewLinePlaceholder}${group4}`;
                }
            }
            return `${this.randomNewLinePlaceholder}${group2}${this.randomNewLinePlaceholder}${this.randomNewLinePlaceholder}${group4}`;
        });
    }

    private static addNewLineBeforeInlineSectionComments(content: string): string {
        const withNewLinesBeforeSectionComments = content.replace(Regexes.inlinePaddedSectionCommentKeyStart, (match, group1, group2, index) => {
            return `${this.randomNewLinePlaceholder}${this.randomNewLinePlaceholder}${group2}`;
        });
        return withNewLinesBeforeSectionComments;
    }

    /**
     * Pads line comments so that they are not lost when flattening/expanding
     */
    private static padSectionCommentKeys(str: string): string {
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
     * Remove line comment paddings
     */
    private static removeLineCommentsPadding(str: string): string {
        const parsed = str.replace(Regexes.paddedSectionCommentPattern, '//');
        return parsed;
    }

    /**
     *  Pad item comments
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
     * Remove item comment padding
     */
    private static removeItemCommentPadding(content: string): string {
        return content.replace(Regexes.paddedItemCommentKey, '');
    }

    private static getRandomNumber(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static addNewLinePlaceHolders(content: string) {
        content = content.replace(/("\w+"\s*:\s*".*",)(\r?\n){2}(?!\s*"\/\/")/gm, (match, group1, group2, index) => {
            // let prefix = '';
            // const restOfString = content.substr(index);
            // const nextNoneCommentKey = Regexes.noneCommentKeyRegex.exec(restOfString);
            // if (nextNoneCommentKey) {
            //     prefix = nextNoneCommentKey[0].split('_')[0] + '_';
            // }
            // let output = `"${prefix}${this.randomNewLinePlaceholder.substr(1)}`;
            // const previousCharacter = content[index - 1];
            // if (['"', '}', ']'].includes(previousCharacter)) {
            //     output = ',' + output;
            // }
            return group1;
        });
        return content.replace(/\r?\n|\r/gm, '');
    }

    private static removeNewLinePlaceHolders(content: string) {
        return content
            .replace(Regexes.newLineTrailingComma, '\n')
            .replace(Regexes.newLinePrecedingComma, '\n')
            .replace(/,(\s*})(?=([^"]*"[^"]*")*[^"]*$)/gm, '$1');
    }

    private static removeWhiteSpaceLines(content: string): string {
        return content.split('\n').map(line => {
            if (line.trim() === '') {
                return '';
            }
            return line;
        }).join('\n');
    }
}