import * as vscode from "vscode";
import { Strings } from "./resources/res-strings";
import { runResJsonCommand } from './lib/resjson-commands/index';
import { ResJsonCommands, FormattingError } from "./lib/models/index";
import { ResJsonDiagnostics } from "./lib/diagnostics";

/**
 * Called when extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  // Register text editor commands
  const flattenByUnderScore = vscode.commands.registerTextEditorCommand("extension.flattenByUnderscore", flattenResJsonByUnderScore);
  const expandByUnderScore = vscode.commands.registerTextEditorCommand("extension.expandByUnderscore", expandResJsonByUndersCore);
  context.subscriptions.push(expandByUnderScore);
  context.subscriptions.push(flattenByUnderScore);

  // Register formatting action
  registerResJsonFormattingProvider();

  // Set up and trigger diagnostic updates'
  configureDiagnostics(context);
}

/**
 * Called when  extension is deactivated
 */
// export function deactivate() { }

export function flattenResJsonByUnderScore() {
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor && isResjsonDocument()) {
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
}

export function expandResJsonByUndersCore() {
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor && isResjsonDocument()) {
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
}

export function registerResJsonFormattingProvider() {
  vscode.languages.registerDocumentFormattingEditProvider(
    "resjson",
    {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        _: vscode.FormattingOptions,
        __: vscode.CancellationToken) {
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
}

export function configureDiagnostics(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('resjson');
  context.subscriptions.push(diagnosticCollection);

  if (vscode.window.activeTextEditor && isResjsonDocument()) {
    ResJsonDiagnostics.updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
  }
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      e => isResjsonDocument(e?.document?.languageId) && ResJsonDiagnostics.updateDiagnostics(e.document, diagnosticCollection)
    )
  );
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(
    (e: vscode.TextEditor | undefined) => {
      if (e !== undefined && isResjsonDocument(e?.document?.languageId)) {
        ResJsonDiagnostics.updateDiagnostics(e.document, diagnosticCollection);
      }
    }));
}

// tslint:disable-next-line:typedef
function isResjsonDocument(documentLingoId?: string) {
  if (!documentLingoId) {
    documentLingoId = vscode.window?.activeTextEditor?.document.languageId;
  }
  return documentLingoId === "resjson";
}
