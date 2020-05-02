import { Regexes, Constants } from "../constants";
import { IndentationOptions } from "../models";

export class Formatting {
    /**
   * Adds new lines as necessary
   * @param str string to be formatted
   */
    public static insertNewLinesAndSpaces(str: string): string {
        const punctuationStack = new Array();
        const newLinePositions = [];

        for (let i = 0; i < str.length; i++) {
            const top = punctuationStack[punctuationStack.length - 1];
            const escaped = str[i - 1] === '\\';
            if (escaped) {
                continue;
            }

            if (top === '"') {
                if (top === str[i]) {
                    punctuationStack.pop();
                }
                continue;
            }

            switch (str[i]) {
                case '"':
                    punctuationStack.push(str[i]);
                    break;
                case ",":
                    newLinePositions.push(i + 1);
                    break;
                case "{":
                    punctuationStack.push(str[i]);
                    newLinePositions.push(i + 1);
                    break;
                case "[":
                    punctuationStack.pop();
                    newLinePositions.push(i);
                    break;

                case "}":
                    if (top === '{') {
                        punctuationStack.pop();
                        newLinePositions.push(i);
                    }
                    break;
                case "]":
                    if (top === '[') {
                        punctuationStack.pop();
                        newLinePositions.push(i);
                    }
                    break;
            }
        }

        let processed = str;
        let addedPadding = 0;
        for (const position of newLinePositions) {
            processed = processed.substring(0, position + addedPadding) + '\n' + processed.substring(position + addedPadding, processed.length);
            addedPadding += 1;
        }

        processed = processed.replace(Regexes.closingBracketsPatter, ': ');
        processed = processed.replace(Regexes.objectEndComma, ',\n');
        return processed;
    }

    /**
     * Formats by adding indentation
     * @param str the lines to be formatted
     * @param insertSpaces whether to use spaces or tabs
     * @param tabSize size of tab in no of spaces
     */
    public static indent(str: string, options?: IndentationOptions): string {
        const linesToIndent = str.split('\n');
        const indentChar = options?.useSpaces ? " " : "\t";
        if (linesToIndent.length <= 1) {
            return linesToIndent.join("\n");
        }

        let tabs = 0;
        linesToIndent.forEach((line, index) => {
            if (line.match((Regexes.objectEndCurlyBracelet))) {
                tabs -= 1;
            }
            if (options?.useSpaces) {
                const spaces = tabs * (options.tabSize || 2);
                linesToIndent[index] = indentChar.repeat(spaces) + line;
            } else {
                linesToIndent[index] = indentChar.repeat(tabs) + line;
            }

            if (line.match(Regexes.objectStartCurlyBracelet)) {
                tabs += 1;
            }
        });
        return linesToIndent.join("\n");
    }

    /**
     * Pads line comments so that they are not lost when flattening/expanding
     */
    private static padLineCommentKeys(str: string): string {
        const result = str.replace(Regexes.lineCommentKeyRegex, (match, index) => {
            let prefix = '';
            const restOfString = str.substr(index);
            const nextNoneCommentKey = Regexes.noneCommentKeyRegex.exec(restOfString);
            if (nextNoneCommentKey) {
                prefix = nextNoneCommentKey[0].split('_')[0] + '_';
            }
            return `${prefix}${Constants.sectionCommentPaddingTextHex}${Formatting.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}`;
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
            const newStartDelimiter = `${Constants.itemCommentPaddingTextHex}${Formatting.getRandomNumber(Constants.randomNumberFloor, Constants.randomNumberCeil)}`;
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

    public static addCommentPadding(content: string): string {
        const withItemCommentPadding = Formatting.padItemComments(content);
        const withLineCommentPadding = Formatting.padLineCommentKeys(withItemCommentPadding);
        return withLineCommentPadding;
    }

    public static removeCommentPadding(content: string): string {
        const withoutLineCommentPadding = Formatting.removeLineCommentsPadding(content);
        const withoutItemCommentPadding = Formatting.removeItemCommentPadding(withoutLineCommentPadding);
        return withoutItemCommentPadding;
    }

    private static getRandomNumber(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}