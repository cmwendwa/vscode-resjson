export interface KeyValue {
  [key: string]: any;
}
export default class Utils {
  /**
   * Flattens provided data with a semi-colon
   * @param content data to be flattened
   */
  public static flatten(content: Object) {
    var result: KeyValue = {};
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

    flattenRecursively(content, "");
    return result;
  }

  /**
   * Expands provided data using underscores
   * @param content
   */
  public static expand(content: KeyValue) {
    if (Object(content) !== content || Array.isArray(content)) {
      return content;
    }
    const regex = /_?([^_\[\]]+)|\[(\d+)\]/g;
    const itemCommentStartRegex = /^_(?=.*\.comment)/;
    const resultHolder: KeyValue = {};
    for (const key in content) {
      let cur: KeyValue = resultHolder;
      let prop = "", m;
      while ((m = regex.exec(key))) {
        cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
        if (itemCommentStartRegex.test(key)) {
          prop = key;
          break;
        }
        prop = m[2] || m[1];
      }

      cur[prop] = content[key];
    }
    return resultHolder[""] || resultHolder;
  }

  /**
   * Adds new lines as necessary
   * @param str string to be formatted
   */
  public static insertNewLines(str: string) {
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

    processed = processed.replace(/(?<="):(?=")/gm, ': ');
    return processed;
  }

  /**
   * Formats by adding indentation
   * @param str the lines to be formatted
   * @param insertSpaces whether to use spaces or tabs
   * @param tabSize size of tab in no of spaces
   */
  public static indent(str: string, insertSpaces?: boolean, tabSize?: number): string {
    const linesToIndent = str.split('\n');
    const indentChar = insertSpaces ? " " : "\t";
    if (linesToIndent.length <= 1) {
      return linesToIndent.join("\n");
    }

    let tabs = 0;
    linesToIndent.forEach((line, index) => {
      if (line.match((/(?<!".*)}(?!.*")/))) {
        tabs -= 1;
      }
      if (insertSpaces) {
        const spaces = tabs * Number(tabSize);
        linesToIndent[index] = indentChar.repeat(spaces) + line;
      } else {
        linesToIndent[index] = indentChar.repeat(tabs) + line;
      }

      if (line.match(/{(?!(.*"))/)) {
        tabs += 1;
      }
    });
    return linesToIndent.join("\n");
  }

  /**
   * Pads line comments so that they are not lost when flattening/expanding
   */
  public static padLineCommentKeys(str: string) {
    const lineCommentRegex = /("\/\/")\s*:\s*".*",?$\n?/gm;
    let res, indices = [];
    while ((res = lineCommentRegex.exec(str))) {
      indices.push(res.index);
    }

    let padSize = 0;
    let result = str;
    const commentLengthOffset = 3;

    for (let i of indices) {
      result = result.substring(0, i + padSize + commentLengthOffset) + (i.toString())
        + result.substring(i + commentLengthOffset + padSize, result.length);
      padSize += (Math.floor(Math.log10(i)) + 1);
    }
    return result;
  }

  /**
   * Remove line comment paddings
   */
  public static removeLineCommentsPadding(str: string): string {
    const paddedLineCommentPattern = /("\/\/\d+")/gm;
    const parsed = str.replace(paddedLineCommentPattern, '"//"');
    return parsed;
  }

  /**
   *  Pad item comments: not using this currently
   */
  public static padItemComments(content: string) {
    const itemCommentStartRegex = /(?<=")_(?=.*\.comment"\s*:.*",?$\n?)/gm;
    const paddedContent = content.replace(itemCommentStartRegex, 'ResJSONCommentTStart_');
    return paddedContent;
  }
}
