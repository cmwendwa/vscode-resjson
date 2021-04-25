import { strict } from "assert";
import { Regexes } from "./constants/regexes";
import { IndentOptions, FormattingError } from "./models";
import { PlaceHolderUtils } from "./utils/placeholder-utils";

export class FormatterInternal {
    private _content: string;

    public get content(): string {
        return this._content;
    }

    constructor(content: string) {
        this._content = content.trim();
    }

    /**
     * Formats input
     * @param options indent options to format text
     * @returns formatted text
     */
    public format(options?: IndentOptions): FormatterInternal {
        return this.removeExtraNewLines()
            .replaceNewLinesWithPlaceHolders()
            .removeDanglingWhiteSpaces()
            .addNewLines()
            .indent(options)
            .addAndStripSpaceAroundColon()
            .addNewLineBeforeInlineSectionComments()
            .removePlaceholders();
    }

    /**
     * Truncate empty spaces to only a maximum of two consecutive newlines
     * Also:
     *  - Remove spaces before '}' and after '{'
     */
    public removeExtraNewLines(): FormatterInternal {
        this._content
            .replace(/\s*}/gm, '}')
            .replace(/{\s*/gm, '{')
            .replace(/\n{2,}/gm, '\n\n');

        return this;
    }

    /**
     * Replace new lines with placehoder JSON entry for new lines
     */
    public replaceNewLinesWithPlaceHolders(): FormatterInternal {
        this._content = PlaceHolderUtils.replaceNewLinesWithPlaceHolders(this._content);
        return this;
    }

    /**
     * Remove all white spaces that are not part of a value
     */
    public removeDanglingWhiteSpaces(): FormatterInternal {
        this._content = this._content.replace(/\s(?=([^"]*"[^"]*")*[^"]*$)/gm, '');
        return this;
    }

    /**
     * Adds new lines as necessary
     */
    public addNewLines(): FormatterInternal {
        const punctuationStack = new Array();
        let processed = "";

        for (let i = 0; i < this._content.length; i++) {
            if (i === strict.length - 1) {
                processed += this._content[i];
                break;
            }
            const top = punctuationStack[punctuationStack.length - 1];
            const escaped = this._content[i - 1] === '\\';
            if (escaped) {
                processed += this._content[i];
                continue;
            }

            if (top === '"') {
                if (top === this._content[i]) {
                    punctuationStack.pop();
                }
                processed += this._content[i];
                continue;
            }

            const punctuations = [',', '{', '}', '[', ']'];

            const unProcessed = this._content.substr(i + 1);
            const appendNewLine = punctuations.includes(this._content[i]) && this.shouldAppendNewLine(processed, unProcessed);

            switch (this._content[i]) {
                case '"':
                    punctuationStack.push(this._content[i]);
                    processed += this._content[i];
                    break;
                case ',':
                    processed += this._content[i];
                    if (appendNewLine) {
                        processed += PlaceHolderUtils.randomNewLinePlaceholder;
                    }
                    break;
                case '{':
                    punctuationStack.push(this._content[i]);
                    if (appendNewLine) {
                        processed += this._content[i] + PlaceHolderUtils.randomNewLinePlaceholder;
                    } else {
                        processed += this._content[i];
                    }
                    break;
                case '[':
                    punctuationStack.push(this._content[i]);
                    processed += this._content[i];
                    if (appendNewLine) {
                        processed += PlaceHolderUtils.randomNewLinePlaceholder;
                    }
                    break;
                case '}':
                    if (top === '{') {
                        punctuationStack.pop();
                        if (this.shouldPrependNewLine(processed)) {
                            const addComma = this._content[i - 1] === ',' ? '' : ',';
                            processed += addComma + PlaceHolderUtils.randomNewLinePlaceholder.slice(0, -1) + this._content[i];
                        } else {
                            processed += this._content[i];
                        }
                    }
                    break;
                case ']':
                    if (top === '[') {
                        punctuationStack.pop();
                        if (appendNewLine) {
                            processed += PlaceHolderUtils.randomNewLinePlaceholder.slice(0, -1) + this._content[i];
                        } else {
                            processed += this._content[i];
                        }
                    }
                    break;
                default:
                    processed += this._content[i];
            }
        }

        if (punctuationStack.length > 0) {
            throw new FormattingError();
        }

        this._content = processed;
        return this;
    }

    /**
     * Formats by adding indentation
     * @param insertSpaces whether to use spaces or tab s
     */
    public indent(options?: IndentOptions): FormatterInternal {
        const indentChar = options?.useSpaces ? " " : "\t";
        let tabs = 0;
        let withIndetation = this._content.replace(Regexes.indentationBreaksPattern, (_, g1, g2, __) => {
            let line;

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

        this._content = withIndetation;
        return this;
    }

    /**
     * Ensures there's only one space to the right of the colon and none to the left
     */
    public addAndStripSpaceAroundColon(): FormatterInternal {
        this._content = this._content.replace(Regexes.closingBracketsPattern, ': ');
        return this;
    }

    /**
     * Adds a newline before resjson section comments ("//": "comment content")
     */
    public addNewLineBeforeInlineSectionComments(): FormatterInternal {
        this._content.replace(Regexes.inlinePaddedSectionCommentKeyStart, (_, __, group2, ___) => {
            return `${PlaceHolderUtils.randomNewLinePlaceholder}${PlaceHolderUtils.randomNewLinePlaceholder}${group2}`;
        });
        return this;
    }

    /**
     * Replace new line placeholders with actual new lines
     */
    private removePlaceholders(): FormatterInternal {
        this._content = PlaceHolderUtils.removePlaceholders(this._content);
        return this;
    }

    /**
     * Returns true if given string does not end or start with a newline
     * @param str
     */
    private shouldAppendNewLine(processed: string, unProcessed: string): boolean {
        return !Regexes.newlineAtEnd.test(processed) && !Regexes.newlineAtStart.test(unProcessed);
    }

    /**
     * Returns true if given string does not end or start with a newline
     * @param str Return
     */
    private shouldPrependNewLine(processed: string): boolean {
        return !Regexes.newlineAtEnd.test(processed);
    }
}

export class Formatter {
    public static format(content: string, indentOptions: IndentOptions): string {
        return new FormatterInternal(content).format(indentOptions).content;
    }
}
