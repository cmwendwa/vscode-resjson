import * as vscode from "vscode";
import Utils from "./utils";

/**
 * Called when extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  const flattenByUnderScore = vscode.commands.registerCommand("extension.flattenByUnderscore", () => {
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor && activeTextEditor.document.languageId === "resjson") {
      try {
        const document = activeTextEditor.document;
        const documentText = document.getText();
        const flat = Utils.flatten(documentText);

        const firstLine = activeTextEditor.document.lineAt(0);
        const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
        const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

        activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
          editBuilder.replace(textRange, flat);
        });
      } catch (error) {
        vscode.window.showErrorMessage('Command RESJSON: Expand by underscore(_), Something went wrong! Ensure file is formatted correctly!');
      }
    } else {
      vscode.window.showWarningMessage("Command RESJSON: Flatten by underscore(_) will only work with a .resjson file.");
    }
  });

  const expandByUnderScore = vscode.commands.registerCommand("extension.expandByUnderscore", () => {
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor && activeTextEditor.document.languageId === "resjson") {
      try {
        const document = activeTextEditor.document;
        const documentText = document.getText();
        const expanded = Utils.expand(documentText);

        const firstLine = activeTextEditor.document.lineAt(0);
        let lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
        const contentNumberOfLines = expanded.split("\n").length + 1;
        let lastPosition =
          contentNumberOfLines > lastLine.lineNumber ? new vscode.Position(contentNumberOfLines, 0) : lastLine.range.end;
        const textRange = new vscode.Range(firstLine.range.start, lastPosition);

        activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
          editBuilder.replace(textRange, expanded);
        });

      } catch (error) {
        vscode.window.showErrorMessage('Command RESJSON: Expand by underscore(_), Something went wrong! Ensure file is formatted correctly!');
      }

    } else {
      vscode.window.showWarningMessage("Command RESJSON: Expand by underscore(_) will only work with a .resjson file.");
    }
  });

  context.subscriptions.push(expandByUnderScore);
  context.subscriptions.push(flattenByUnderScore);
}

/**
 * Called when  extension is deactivated
 */
export function deactivate() { }
