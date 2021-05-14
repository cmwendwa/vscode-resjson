import * as vscode from "vscode";

import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import { isCommaMissing } from '../utils/comma-missing';
import { Strings } from '../../resources/res-strings';
import { DiagnosticCodes } from '../constants/general';
import { Regexes } from '../constants/regexes';

export class EndCommaDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];
        const restOfContent = splitDoc.slice(index + 1).join('').trim();

        if (isCommaMissing(line, restOfContent)) {
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

        if(this.isTrailingComma(line, restOfContent)){
            const trailingCommaDiag: vscode.Diagnostic = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(
                        index, line.search(Regexes.endOfLineComma)
                    ),
                    new vscode.Position(
                        index, line.search(Regexes.endOfLineComma)
                    )
                ),
                Strings.diagnosticMessages.trailingCommaError,
                vscode.DiagnosticSeverity.Error
            );

            trailingCommaDiag.code = DiagnosticCodes.TrailingCommaError;
            diagnostics.push(trailingCommaDiag);
        }

        return diagnostics;
    }

    private static isTrailingComma(line: string, restOfContent: string): boolean {
        const lastLineChar = line && line.trimRight().substr(-1);
        const firstContentChar = restOfContent && restOfContent.trimLeft()[0]
        return lastLineChar === ',' && firstContentChar === '}'
    }
}
