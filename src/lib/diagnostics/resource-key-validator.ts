import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";
import { Strings } from '../../resources/res-strings';

export class ResourceKeyDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];

        if (!line.trim()) {
            return diagnostics;
        }

        const resourceQuery = Regexes.resourceKeyRegex.exec(line);
        const resourceKey = resourceQuery && resourceQuery[0];

        if (resourceKey) {
            const resourceRegex = new RegExp(`"${resourceKey}"\\s*`);
            const restOfContent = splitDoc.slice(0, index).concat(
                splitDoc.slice(index + 1,)
            ).join('');

            if (resourceRegex.test(restOfContent)) {
                const duplicateKeyMatchDiag: vscode.Diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(
                            index, line.search(/\S/)
                        ),
                        new vscode.Position(index, line.length)
                    ),
                    Strings.diagnosticMessages.resourceKeyExistsError,
                    vscode.DiagnosticSeverity.Error,
                );
                diagnostics.push(duplicateKeyMatchDiag);
            }
        } else if (
            !(
                Regexes.resourceCommentKeyRegex.test(line) ||
                Regexes.resourceCommentLikeRegex1.test(line) ||
                Regexes.resourceCommentLikeRegex2.test(line) ||
                Regexes.resourceCommentLikeRegex3.test(line) ||
                Regexes.lineCommentRegex.test(line) ||
                Regexes.lineCommentLikeRegex.test(line) ||
                ['}', '{'].includes(line.trim())
            )
        ) {
            if (resourceKey?.length === 0) {
                const duplicateKeyMatchDiag: vscode.Diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(
                            index, line.search(/\S/)
                        ),
                        new vscode.Position(index, line.length)
                    ),
                    Strings.diagnosticMessages.resourceKeyEmptyError,
                    vscode.DiagnosticSeverity.Error,
                );
                diagnostics.push(duplicateKeyMatchDiag);
            } else {
                const duplicateKeyMatchDiag: vscode.Diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(
                            index, line.search(/\S/)
                        ),
                        new vscode.Position(index, line.length)
                    ),
                    Strings.diagnosticMessages.invalidResourceKey,
                    Regexes.fullResourceRegex.test(line) ?
                        vscode.DiagnosticSeverity.Warning
                        : vscode.DiagnosticSeverity.Error,
                );
                diagnostics.push(duplicateKeyMatchDiag);
            }
        }

        return diagnostics;
    }
}
