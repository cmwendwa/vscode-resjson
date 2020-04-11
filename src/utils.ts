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
    const resultholder: KeyValue = {};
    for (const p in data) {
      let cur: KeyValue = resultholder;
      let prop = "",
        m;
      while ((m = regex.exec(p))) {
        cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
        prop = m[2] || m[1];
      }
      cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
  }

  public static insertNewLines(str: string) {
    let processed = str.replace(/{/g, "{\n");
    processed = processed.replace(/}/g, "\n}");
    processed = processed.replace(/,(?!\s)/g, ",\n");
    processed = processed.replace(/:(?!\s)/g, ": ");
    processed = processed.replace(/\[(?!\s)/g, "[\n");
    processed = processed.replace(/(?!\s)\]/g, "\n]");
    return processed;
  }

  public static indent(linesToIndent: string[], insertSpaces?: boolean, tabSize?: number): string {
    const indentChar = insertSpaces ? " " : "\t";
    if (linesToIndent.length <= 1) {
      return linesToIndent.join("\n"); // Skip indentation
    }

    let tabs = 0;
    linesToIndent.forEach((line, index) => {
      if (line.includes("}") && !line.match(/}(?:(?<=["']:)|(?=["']))/)) {
        tabs -= 1;
      }
      if (insertSpaces) {
        const spaces = tabs * Number(tabSize);
        linesToIndent[index] = indentChar.repeat(spaces) + line;
      } else {
        linesToIndent[index] = indentChar.repeat(tabs) + line;
      }

      if (line.includes("{") && !line.match(/{(?:(?<=["']:)|(?=["']))/)) {
        tabs += 1;
      }
    });
    return linesToIndent.join("\n");
  }
}
