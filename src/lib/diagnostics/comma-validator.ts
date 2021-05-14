import * as vscode from "vscode";

import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import { isCommaMissing } from '../utils/comma-missing';
import { Strings } from '../../resources/res-strings';
import { DiagnosticCodes } from '../constants/general';

export class EndCommaDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];
        if (isCommaMissing(line, splitDoc.slice(index + 1).join('').trim())) {
            const missingEndCharDiag: vscode.Diagnostic = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(
                        index, line.search(/\S/)
                    ),
                    new vscode.Position(index, line.length)
                ),
                Strings.diagnosticMessages.missingCommaError,
                vscode.DiagnosticSeverity.Error
            );

            missingEndCharDiag.code = DiagnosticCodes.MissingCommaError;
            diagnostics.push(missingEndCharDiag);
        }
        return diagnostics;
    }
}
