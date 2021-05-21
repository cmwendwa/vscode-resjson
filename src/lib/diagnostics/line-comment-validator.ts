import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";
import { DiagnosticCodes } from '../constants/general';
import { Strings } from '../../resources/res-strings';

export class LineCommentsDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];
        if (Regexes.lineCommentLikeRegex.test(line) && !Regexes.lineCommentRegex.test(line)) {
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
