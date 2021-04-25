import { FormattingError, IndentOptions, KeyValue } from "./models";
import { PlaceHolderUtils } from "./utils/placeholder-utils";
import { Formatter } from './formatter';
import { Regexes } from "./constants/regexes";

export class Transformer {
    /**
     * Flattens provided data with a underscore
     * @param content data to be flattened
     */
    public static flatten(content: string, indentOptions: IndentOptions): string {
        try {
            const withPlaceholders = PlaceHolderUtils.addPlaceholders(this.format(content, indentOptions));
            const parsedContent = JSON.parse(withPlaceholders);
            const flattened = JSON.stringify(this.flattenObject(parsedContent));
            return this.format(flattened, indentOptions);
        } catch (error) {
            throw new FormattingError();
        }
    }

    private static flattenObject(obj: object) {
        let result: KeyValue = {};
        const flattenRecursively = (current: KeyValue, property: string) => {
            if (Object(current) !== current) {
                result[property] = current;
            } else if (Array.isArray(current)) {
                for (let i = 0, l = current.length; i < l; i++) {
                    flattenRecursively(current[i], property + "[" + i + "]");
                }
                if (current.length === 0) {
                    result[property] = [];
                }
            } else {
                var isEmpty = true;
                for (const p in current) {
                    isEmpty = false;
                    flattenRecursively(current[p], property ? property + "_" + p : p);
                }
                if (isEmpty && property) {
                    result[property] = {};
                }
            }
        };

        flattenRecursively(obj, "");
        return result;
    }

    /**
     * Expands provided data using underscores
     * @param content
     */
    public static expand(content: string, indentOptions: IndentOptions): string {
        try {
            const withPlaceholders = PlaceHolderUtils.addPlaceholders(this.format(content, indentOptions));
            const parsedContent = JSON.parse(withPlaceholders);
            const expanded = JSON.stringify(this.expandObject(parsedContent));
            return this.format(expanded, indentOptions);
        } catch (error) {
            throw new FormattingError();
        }
    }

    private static expandObject(obj: KeyValue) {
        const resultHolder: KeyValue = {};
        const keys = Object.keys(obj);
        for (const index in keys) {
            const key = keys[index];
            const {
                keySeparatorPattern,
                paddedItemCommentKeyStart,
                paddedSectionCommentKeyStart,
                newLinePlaceholderKey
            } = Regexes;
            let cur: KeyValue = resultHolder;
            let prop = "initial",
                parts;

            while ((parts = keySeparatorPattern.exec(key))) {
                if (
                    (paddedSectionCommentKeyStart.test(prop)) ||
                    newLinePlaceholderKey.test(prop) ||
                    paddedItemCommentKeyStart.test(prop)
                ) {
                    prop = key;
                    break;
                }
                cur = cur[prop] || (cur[prop] = parts[2] ? [] : {});
                prop = parts[2] || parts[1];
            }
            cur[prop] = obj[key];
        }
        return resultHolder["initial"] || resultHolder;
    }

    private static format(content: string, indentOptions: IndentOptions) {
        return Formatter.format(content, indentOptions);
    }
}
