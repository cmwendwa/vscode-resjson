import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";

export class LineCommentsDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];
        if (Regexes.lineCommentLikeRegex.test(line) && !Regexes.lineCommentRegex.test(line)) {
            const warnMessage = 'Is this suppossed to be a line comment? As is it is not valid line comment. A valid item comment is in the form: "//": "comment_value"';
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
