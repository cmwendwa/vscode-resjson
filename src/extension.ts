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
      const withPaddedComments = Utils.addCommentPadding(documentText);
      const parsedContent = JSON.parse(withPaddedComments);
      const flat = Utils.flatten(parsedContent);

      const withNewlines = Utils.insertNewLines(JSON.stringify(flat));
      const withIndentation = Utils.indent(withNewlines);
      const withoutPaddedComments = Utils.removeCommentPadding(withIndentation);

      const firstLine = editor.document.lineAt(0);
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
      editor.edit(editBuilder => {
        editBuilder.replace(textRange, withoutPaddedComments);
      });
    }
  });

  const expandByUnderScore = vscode.commands.registerCommand("extension.expandByUnderscore", () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const documentText = document.getText();
      const withPaddedComments = Utils.addCommentPadding(documentText);
      const parsedContent = JSON.parse(withPaddedComments);
      const expanded = Utils.expand(parsedContent);

      const withNewlines = Utils.insertNewLines(JSON.stringify(expanded));
      const withIndentation = Utils.indent(withNewlines, !!editor.options.insertSpaces, Number(editor.options.tabSize));
      const withoutPaddedComments = Utils.removeCommentPadding(withIndentation);

      const firstLine = editor.document.lineAt(0);
      let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const contentNumberOfLines  = withIndentation.split('\n').length;
      let lastPosition = contentNumberOfLines > lastLine.lineNumber ? new vscode.Position(contentNumberOfLines, 0) : lastLine.range.end;
      const textRange = new vscode.Range(firstLine.range.start, lastPosition);
      editor.edit(editBuilder => {
        editBuilder.replace(textRange, withoutPaddedComments);
      });
    }
  });

  context.subscriptions.push(expandByUnderScore);
  context.subscriptions.push(flattenByUnderScore);
}

/**
 * Called when  extension is deactivated
 */
export function deactivate() { }
