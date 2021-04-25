import * as vscode from "vscode";
import { Strings } from "./resources/res-strings";
import { runResJsonCommand } from './lib/resjson-commands/index';
import { ResJsonCommands, FormattingError } from "./lib/models/index";

/**
 * Called when extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  const flattenByUnderScore = vscode.commands.registerTextEditorCommand("extension.flattenByUnderscore", () => {
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor && activeTextEditor.document.languageId === "resjson") {
      try {
        const document = activeTextEditor.document;
        const flat = runResJsonCommand(ResJsonCommands.Flatten, document.getText());

        const firstLine = activeTextEditor.document.lineAt(0);
        const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
        const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

        activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
          editBuilder.replace(textRange, flat);
        });
      } catch (error) {
        if (error instanceof FormattingError) {
          vscode.window.showErrorMessage(Strings.errorParsing);
        } else {
          vscode.window.showErrorMessage(Strings.somethingWentWrongFlattening);
        }
      }
    } else {
      vscode.window.showWarningMessage(Strings.flattenCommandNotSupported);
    }
  });

  const expandByUnderScore = vscode.commands.registerTextEditorCommand("extension.expandByUnderscore", () => {
    const { activeTextEditor } = vscode.window;
    if (activeTextEditor && activeTextEditor.document.languageId === "resjson") {
      try {
        const document = activeTextEditor.document;
        const expanded = runResJsonCommand(ResJsonCommands.Expand, document.getText());

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
        if (error instanceof FormattingError) {
          vscode.window.showErrorMessage(Strings.errorParsing);
        } else {
          vscode.window.showErrorMessage(Strings.somethingWentWrongExpanding);
        }
      }
    } else {
      vscode.window.showWarningMessage(Strings.expandCommandNotSupported);
    }
  });

  vscode.languages.registerDocumentFormattingEditProvider(
    "resjson",
    {
      provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken) {
        const formattedContent = runResJsonCommand(ResJsonCommands.Format, document.getText());
        const firstLine = document.lineAt(0);
        let lastLine = document.lineAt(document.lineCount - 1);
        const contentNumberOfLines = formattedContent.split("\n").length + 1;
        let lastPosition =
          contentNumberOfLines > lastLine.lineNumber ? new vscode.Position(contentNumberOfLines, 0) : lastLine.range.end;
        const textRange = new vscode.Range(firstLine.range.start, lastPosition);

        return [vscode.TextEdit.replace(textRange, formattedContent)];
      }
    }
  );

  context.subscriptions.push(expandByUnderScore);
  context.subscriptions.push(flattenByUnderScore);
}

/**
 * Called when  extension is deactivated
 */
export function deactivate() { }
