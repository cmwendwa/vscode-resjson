import * as vscode from "vscode";
import { Regexes } from '../constants';
import { Formatting } from "./formatting-utils";
import { KeyValue, IndentationOptions } from "../models";

export default class CommandUtils {
  /**
   * Flattens provided data with a semi-colon
   * @param content data to be flattened
   */
  public static flatten(content: string): string {
    const withPaddedComments = Formatting.addCommentPadding(content);
    const parsedContent = JSON.parse(withPaddedComments);
    const flattened = CommandUtils.flattenObject(parsedContent);

    const withNewlines = Formatting.insertNewLinesAndSpaces(JSON.stringify(flattened));
    const withIndentation = Formatting.indent(withNewlines);
    const withoutPaddedComments = Formatting.removeCommentPadding(withIndentation);
    return withoutPaddedComments;
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
  public static expand(content: string): string {
    const withPaddedComments = Formatting.addCommentPadding(content);
    const parsedContent = JSON.parse(withPaddedComments);
    const expanded = CommandUtils.expandObject(parsedContent);
    const withNewlines = Formatting.insertNewLinesAndSpaces(JSON.stringify(expanded));

    const inDentationOptions: IndentationOptions = {};
    if (vscode.window.activeTextEditor) {
      inDentationOptions.useSpaces = !!vscode.window.activeTextEditor.options.insertSpaces;
      inDentationOptions.tabSize = Number(vscode.window.activeTextEditor.options.tabSize);
    }
    const withIndentation = Formatting.indent(
      withNewlines,
      inDentationOptions
    );
    const withoutPaddedComments = Formatting.removeCommentPadding(withIndentation);
    return withoutPaddedComments;
  }

  private static expandObject(obj: KeyValue) {
    const resultHolder: KeyValue = {};
    for (const key in obj) {
      const {
        keySeparatorPattern,
        paddedItemCommentKeyStart,
        paddedSectionCommentKeyStart
      } = Regexes;
      let cur: KeyValue = resultHolder;
      let prop = "initial", parts;
      while ((parts = keySeparatorPattern.exec(key))) {
        if (paddedSectionCommentKeyStart.test(key) || paddedItemCommentKeyStart.test(prop)) {
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
}
