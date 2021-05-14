import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";
import { Strings } from '../../resources/res-strings';
import { DiagnosticCodes } from '../constants/general';

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
                const missingCommentMatchDiag: vscode.Diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(
                            index, line.search(/\S/)
                        ),
                        new vscode.Position(index, line.length)
                    ),
                    Strings.diagnosticMessages.resourceCommentMatchError,
                    vscode.DiagnosticSeverity.Error,
                );
                missingCommentMatchDiag.code = DiagnosticCodes.ResourceCommentMatchError;
                diagnostics.push(missingCommentMatchDiag);
            }
        }

        if (
            (Regexes.resourceCommentLikeRegex1.test(line) || Regexes.resourceCommentLikeRegex2.test(line) || Regexes.resourceCommentLikeRegex3.test(line)
            ) && !Regexes.resourceCommentKeyRegex.test(line)) {
            const supposedCommentWarning: vscode.Diagnostic = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(
                        index, line.search(/\S/)
                    ),
                    new vscode.Position(index, line.length)
                ),
                Strings.diagnosticMessages.resourceCommentWarning,
                vscode.DiagnosticSeverity.Warning,
            );
            supposedCommentWarning.code = DiagnosticCodes.ResouceCommentWarning;
            diagnostics.push(supposedCommentWarning);
        }

        return diagnostics;
    }
}
