import { Range, SnippetString, window } from "vscode";

export async function insertLine(line: string, insertionLocation: Range) {
    let snippet = new SnippetString(line);

    return window?.activeTextEditor?.insertSnippet(snippet, insertionLocation);
}