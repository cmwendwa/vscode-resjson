import * as vscode from "vscode";
import { CodeAction, CodeActionKind, Command, Position, Range } from "vscode";
import { Regexes } from "../constants/regexes";
import { isCommaMissing } from '../utils/comma-missing';
import { keyMissingComment } from "../utils/comment-missing";

export class ResJsonCodeActionsProvider implements vscode.CodeActionProvider {
    public provideCodeActions(
        document: vscode.TextDocument,
        _: vscode.Range,
        __: vscode.CodeActionContext,
        ___: vscode.CancellationToken
    ):
        vscode.CodeAction[] | Thenable<vscode.CodeAction[]> {
        const splitDoc = document.getText().split('\n');
        const codeActions: CodeAction[] = [];

        for (let i = 0; i < splitDoc.length - 1; i++) {
            const line = splitDoc[i];
            const resourceQuery = Regexes.resourceKeyRegex.exec(line);
            const resourceKey = resourceQuery && resourceQuery[0];
            const restOfContent = splitDoc.slice(0, i).concat(
                splitDoc.slice(i + 1,)
            ).join('');
            if (isCommaMissing(line, splitDoc.slice(i + 1).join(''))) {
                let commaInsertiontLocation = new Range(i, 0, i, line.trimRight().length + 1);

                const fix = new CodeAction('Insert comma at the end', CodeActionKind.QuickFix);
                fix.edit = new vscode.WorkspaceEdit();
                fix.edit.replace(document.uri, commaInsertiontLocation, line + ',');
                codeActions.push(fix);
            }

            const value = line.split(/:(.+)/)[1];
            if (resourceKey && keyMissingComment(
                resourceKey,
                value,
                restOfContent
            )) {
                const indent = line.split(/\S(,*)/)[0];
                const commentPositionBelow = new Position(i + 1, line.search(/\S/));
                const commentPositionAbove = new Position(i, line.search(/\S/));
                const addComma = line.trimRight().substr(-1) === ',';
                const comment = `"_${resourceKey}.comment": ""${addComma ? ',\n' + indent : '\n'}`;

                const fixBelow = new CodeAction('Insert comment in the line below', CodeActionKind.QuickFix);
                fixBelow.edit = new vscode.WorkspaceEdit();
                fixBelow.edit.insert(document.uri, commentPositionBelow, comment);
                codeActions.push(fixBelow);

                const fixAbove = new CodeAction('Insert comment in the line above', CodeActionKind.QuickFix);
                fixAbove.edit = new vscode.WorkspaceEdit();
                fixAbove.edit.insert(document.uri, commentPositionAbove, comment);
                codeActions.push(fixAbove);
            }
        }

        return codeActions;
    }
}

/**
 * TODO: Provide code actions corresponding to diagnostic problems?
 */
// export class ResJsonCodeActionsInfo implements vscode.CodeActionProvider {

//     public static readonly providedCodeActionKinds = [
//         vscode.CodeActionKind.QuickFix
//     ];

//     provideCodeActions(
//         _: vscode.TextDocument, __: vscode.Range | vscode.Selection,
//         context: vscode.CodeActionContext, ___: vscode.CancellationToken
//     ): vscode.CodeAction[] {
//         return context.diagnostics
//             .filter(diagnostic => diagnostic.message === 'CODE')
//             .map(diagnostic => this.createMissingCommaCodeAction(diagnostic));
//     }

//     private createMissingCommaCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
//         const action = new vscode.CodeAction('Add comma', vscode.CodeActionKind.QuickFix);
//         action.command = { command: 'extension.insertLine', title: 'Add comma 2', tooltip: 'This will will add a comma at the end of the line' };
//         action.diagnostics = [diagnostic];
//         action.isPreferred = true;
//         return action;
//     }
// }