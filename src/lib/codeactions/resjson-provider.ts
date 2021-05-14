import * as vscode from "vscode";
import { CodeAction, CodeActionKind, Position, Range } from "vscode";
import { Constants, DiagnosticCodes } from '../constants/general';
import { Regexes } from "../constants/regexes";

export class ResJsonCodeActionsInfo implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(
        document: vscode.TextDocument, __: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext, ___: vscode.CancellationToken
    ): vscode.CodeAction[] {
        let actions: vscode.CodeAction[] = [];
        context.diagnostics
            .filter(diagnostic => !!diagnostic.code && Constants.actionableDiagnostics.includes(<DiagnosticCodes>diagnostic.code))
            .forEach(diagnostic => {
                actions = actions.concat(this.createCodeActions(diagnostic, document));
            });

        return actions;
    }

    private createCodeActions(diagnostic: vscode.Diagnostic, document: vscode.TextDocument): vscode.CodeAction[] {
        const codeActions = [];

        const lineNumber = diagnostic.range.start.line;
        const line = document.lineAt(lineNumber).text;
        const prevLine = lineNumber > 0 ? document.lineAt(lineNumber - 1) : null;

        const resourceQuery = Regexes.resourceKeyRegex.exec(line);
        const resourceKey = resourceQuery && resourceQuery[0];

        // tslint:disable-next-line:switch-default
        switch (diagnostic.code) {
            case DiagnosticCodes.MissingCommaError:
                let commaInsertiontLocation = new Range(lineNumber, 0, lineNumber, line.trimRight().length + 1);

                const commaFix = new CodeAction('Insert comma at the end', CodeActionKind.QuickFix);
                commaFix.isPreferred = true;
                commaFix.diagnostics = [diagnostic];
                commaFix.edit = new vscode.WorkspaceEdit();
                commaFix.edit.replace(document.uri, commaInsertiontLocation, line + ',');
                codeActions.push(commaFix);
                break;

            case DiagnosticCodes.TrailingCommaError:
                const endCommaPosition = line.search(Regexes.endOfLineComma);
                let trailingCommaLocation = new Range(lineNumber, endCommaPosition , lineNumber, endCommaPosition + 1);

                const trailingCommaFix = new CodeAction('Remove trailing comma', CodeActionKind.QuickFix);
                trailingCommaFix.isPreferred = true;
                trailingCommaFix.diagnostics = [diagnostic];
                trailingCommaFix.edit = new vscode.WorkspaceEdit();
                trailingCommaFix.edit.replace(document.uri, trailingCommaLocation, '');
                codeActions.push(trailingCommaFix);
                break;

            case DiagnosticCodes.MissingResourceComment:
                const commentPositionBelow = new Position(lineNumber + 1, 0);
                const commentPositionAbove = new Position(lineNumber, line.search(/\S/));
                const addComma = line.trimRight().substr(-1) === ',';
                const indent = line.split(/\S(,*)/)[0];
                const commentBelow = `${indent}"_${resourceKey}.comment": ""${addComma ? ',\n' : '\n'}`;
                const commentAbove = `"_${resourceKey}.comment": "",\n`;

                const fixBelow = new CodeAction('Insert comment in the line below', CodeActionKind.QuickFix);
                fixBelow.diagnostics = [diagnostic];
                fixBelow.isPreferred = true;
                fixBelow.edit = new vscode.WorkspaceEdit();
                fixBelow.edit.insert(document.uri, commentPositionBelow, commentBelow);
                codeActions.push(fixBelow);

                const fixAbove = new CodeAction('Insert comment in the line above', CodeActionKind.QuickFix);
                fixAbove.diagnostics = [diagnostic];
                fixAbove.edit = new vscode.WorkspaceEdit();
                fixAbove.edit.insert(document.uri, commentPositionAbove, commentAbove);
                codeActions.push(fixAbove);
                break;

            case DiagnosticCodes.ResourceKeyExistsError:
                const startPoint1 = prevLine ? lineNumber - 1 : lineNumber;
                const startPoint2 = prevLine ? prevLine.text.length : 0;
                const keyLocation = new Range(startPoint1, startPoint2, lineNumber, line.length);

                const fixDuplicateKey = new CodeAction('Delete resource', CodeActionKind.QuickFix);
                fixDuplicateKey.diagnostics = [diagnostic];
                fixDuplicateKey.isPreferred = true;
                fixDuplicateKey.edit = new vscode.WorkspaceEdit();
                fixDuplicateKey.edit.delete(document.uri, keyLocation);
                codeActions.push(fixDuplicateKey);
                break;
        }

        return codeActions;
    }
}
