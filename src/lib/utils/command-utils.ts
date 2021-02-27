import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";
import { Strings } from "../../resources/res-strings";
import { Formatting } from "./formatting";
import { KeyValue, FormattingError } from "../models";

export default class CommandUtils {
  /**
   * Flattens provided data with a underscore
   * @param content data to be flattened
   */
  public static flatten(document: vscode.TextDocument): string {
    const content = document.getText();
    try {
      const withPaddingsAndPlaceholder = Formatting.addPlaceholders(content);
      const parsedContent = JSON.parse(withPaddingsAndPlaceholder);
      const flattened = JSON.stringify(CommandUtils.flattenObject(parsedContent));
      return Formatting.format(flattened);
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
  public static expand(document: vscode.TextDocument): string {
    const content = document.getText().trim();
    try {
      const withPaddingsAndPlaceholder = Formatting.addPlaceholders(content);
      const parsedContent = JSON.parse(withPaddingsAndPlaceholder);
      const expanded = JSON.stringify(CommandUtils.expandObject(parsedContent));
      return Formatting.format(expanded);
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

  /**
   * Formats a given document opinionatadely
   * @param document to be formated
   */
  public static format(document: vscode.TextDocument): string {
    try {
      const content = document.getText().trim();
      const formattedContent = Formatting.format(content);
      return formattedContent;
    } catch (error) {
      vscode.window.showErrorMessage(Strings.errorParsing);
      return document.getText();
    }
  }
}
