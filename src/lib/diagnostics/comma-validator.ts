import * as vscode from "vscode";

import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";

export class EndCommaDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];
        if (!this.isLastLine(splitDoc.slice(index + 1).join('').trim())) {
            const lastChar = line.trim().substr(-1);
            if (!!line.trim() && !!lastChar && lastChar !== ',' && lastChar !== '{') {
                const errMessage = 'Expected line to end with a comma';
                const missingEndCharDiag: vscode.Diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(
                            index, line.search(/\S/)
                        ),
                        new vscode.Position(index, line.length)
                    ),
                    errMessage,
                    vscode.DiagnosticSeverity.Error,
                );
                diagnostics.push(missingEndCharDiag);
            }
        }

        return diagnostics;
    }

    private static isLastLine(remainingContent: string): boolean {
        return !remainingContent || remainingContent.startsWith('}');
    }
}
