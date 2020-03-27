import * as vscode from "vscode";
import Utils from "./utils";

/**
 * Called when extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  const flattenByUnderScore = vscode.commands.registerCommand("extension.flattenByUnderscore", () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const documentText = document.getText();
      const flat = Utils.flatten(JSON.parse(documentText));

      const firstLine = editor.document.lineAt(0);
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

      const withNewlines = Utils.insertNewLines(JSON.stringify(flat));
      const toIndent = withNewlines.split('\n');
      const withIndentation = Utils.indent(toIndent);

      editor.edit(editBuilder => {
        editBuilder.replace(textRange, withIndentation);
      });
    }
  });

  const expandByUnderScore = vscode.commands.registerCommand("extension.expandByUnderscore", () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const documentText = document.getText();
      const unflat = Utils.unflatten(JSON.parse(documentText));

      const firstLine = editor.document.lineAt(0);
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

      const withNewlines =  Utils.insertNewLines(JSON.stringify(unflat));
      const toIndent = withNewlines.split("\n");
      const withIndentation = Utils.indent(toIndent, !!editor.options.insertSpaces, Number(editor.options.tabSize));

      editor.edit(editBuilder => {
        editBuilder.replace(textRange, withIndentation);
      });
    }
  });

  context.subscriptions.push(expandByUnderScore);
  context.subscriptions.push(flattenByUnderScore);
}

/**
 * Called when  extension is deactivated
 */
export function deactivate() {}
