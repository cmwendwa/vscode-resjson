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
      const withPaddedLineComments = Utils.padLineCommentKeys(documentText);
      const parsedContent = JSON.parse(withPaddedLineComments);
      const flat = Utils.flatten(parsedContent);

      const withoutPaddedLineComments = Utils.removeLineCommentsPadding(JSON.stringify(flat));
      const withNewlines = Utils.insertNewLines(withoutPaddedLineComments);
      const withIndentation = Utils.indent(withNewlines);

      const firstLine = editor.document.lineAt(0);
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
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
      const withPaddedLineComments = Utils.padLineCommentKeys(documentText);
      const parsedContent = JSON.parse(withPaddedLineComments);
      const expanded = Utils.expand(parsedContent);

      const withoutPaddedLineComments = Utils.removeLineCommentsPadding(JSON.stringify(expanded));
      const withNewlines = Utils.insertNewLines(withoutPaddedLineComments);
      const withIndentation = Utils.indent(withNewlines, !!editor.options.insertSpaces, Number(editor.options.tabSize));

      const firstLine = editor.document.lineAt(0);
      let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
      const contentNumberOfLines  = withIndentation.split('\n').length;
      let lastPosition = contentNumberOfLines > lastLine.lineNumber ? new vscode.Position(contentNumberOfLines, 0) : lastLine.range.end;
      const textRange = new vscode.Range(firstLine.range.start, lastPosition);
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
export function deactivate() { }
