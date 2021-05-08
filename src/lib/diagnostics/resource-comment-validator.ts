import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";

export class ResourceCommentDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];
        const resourceQuery = Regexes.resourceCommentKeyRegex.exec(line);
        const resourceKey = resourceQuery && resourceQuery[0];
        if (resourceKey) {
            const resourceRegex = new RegExp(`"${resourceKey}"\\s*`);
            const restOfContent = splitDoc.slice(0, index).concat(
                splitDoc.slice(index + 1,)
            ).join('');

            if (!resourceRegex.test(restOfContent)) {
                const errMessage = 'This comment does not match any resource key in the document.';
                const missingCommentMatchDiag: vscode.Diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(
                            index, line.search(/\S/)
                        ),
                        new vscode.Position(index, line.length)
                    ),
                    errMessage,
                    vscode.DiagnosticSeverity.Error,
                );
                diagnostics.push(missingCommentMatchDiag);
            }
        }

        if (
            (Regexes.resourceCommentLikeRegex1.test(line) || Regexes.resourceCommentLikeRegex2.test(line) || Regexes.resourceCommentLikeRegex3.test(line)
            ) && !Regexes.resourceCommentKeyRegex.test(line)) {
            const warnMessage = 'Is this suppossed to be a resource comment? As is, it is not valid resource comment. A valid item comment is in the form: "_<key>.comment": "comment_value"';
            const supposedCommentWarning: vscode.Diagnostic = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(
                        index, line.search(/\S/)
                    ),
                    new vscode.Position(index, line.length)
                ),
                warnMessage,
                vscode.DiagnosticSeverity.Warning,
            );
            diagnostics.push(supposedCommentWarning);
        }

        return diagnostics;
    }
}
