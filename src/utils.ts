export interface KeyValue {
  [key: string]: any;
}
export default class Utils {
  public static flatten(data: any) {
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

    flattenRecursively(data, "");
    return result;
  }

  public static unflatten(data: KeyValue) {
    if (Object(data) !== data || Array.isArray(data)) {
      return data;
    }
    const regex = /_?([^_\[\]]+)|\[(\d+)\]/g;
    const itemCommentStartRegex = /^_(?=.*\.comment)/;
    const resultHolder: KeyValue = {};
    for (const p in data) {
      let cur: KeyValue = resultHolder;
      let prop = "", m;
      while ((m = regex.exec(p))) {
        cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
        if (itemCommentStartRegex.test(p)) {
          prop = p;
          break;
        }
        prop = m[2] || m[1];
      }

      cur[prop] = data[p];
    }
    return resultHolder[""] || resultHolder;
  }

  public static insertNewLines(str: string) {
    const punctuationStack = new Array();
    const newLinePositions = [];

    for (let i = 0; i < str.length; i++) {
      const top = punctuationStack[punctuationStack.length - 1];
      if (str[i] === '"') {
        if (top === str[i]) {
          punctuationStack.pop();
        } else {
          punctuationStack.push(str[i]);
        }
        continue;
      }

      if (str[i] === "'") {
        if (top === str[i]) {
          punctuationStack.pop();
        } else {
          punctuationStack.push(str[i]);
        }
        continue;
      }

      if (top === '"' || top === "'") {
        continue;
      }

      if (str[i] === ",") {
        newLinePositions.push(i + 1);
        continue;
      }

      if (str[i] === "{") {
        punctuationStack.push(str[i]);
        newLinePositions.push(i + 1);
        continue;
      }

      if (str[i] === "[") {
        punctuationStack.push(str[i]);
        newLinePositions.push(i + 1);
        continue;
      }

      if (str[i] === "}") {
        if (top === '{') {
          punctuationStack.pop();
          newLinePositions.push(i);
          continue;
        }
      }

      if (str[i] === "]") {
        if (top === '[') {
          punctuationStack.pop();
          newLinePositions.push(i);
          continue;
        }
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

  public static indent(linesToIndent: string[], insertSpaces?: boolean, tabSize?: number): string {
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

  public static removeLineCommentsPadding(str: string): string {
    const paddedLineCommentPattern = /("\/\/\d+")/gm;
    const parsed = str.replace(paddedLineCommentPattern, '"//"');
    return parsed;
  }

  public static padItemComments(content: string) {
    const itemCommentStartRegex = /(?<=")_(?=.*\.comment"\s*:.*",?$\n?)/gm;
    const paddedContent = content.replace(itemCommentStartRegex, 'ResJSONCommentTStart_');
    return paddedContent;
  }
}
