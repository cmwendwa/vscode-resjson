import * as vscode from "vscode";
import { EndCommaDiagnosticValidator } from './comma-validator';
import { ResourceCommentDiagnosticValidator } from './resource-comment-validator';
import { LineCommentsDiagnosticValidator } from './line-comment-validator';
import { BaseDiagnosticsValidation } from './base-diagnostic-validator';
import { ResourceKeyDiagnosticValidator } from './resource-key-validator';

export class ResJsonDiagnostics extends BaseDiagnosticsValidation {
    public static updateDiagnostics(document: vscode.TextDocument, diagnosticCollection: any) {
        let aggregateDiagnostics: vscode.Diagnostic[] = [];
        diagnosticCollection.clear();

        const splitDoc = document.getText().split('\n');

        for (let i = 0; i < splitDoc.length - 1; i++) {
            const newDiags = this.validate(splitDoc, i);
            if (newDiags.length > 0) {
                aggregateDiagnostics = aggregateDiagnostics.concat(newDiags);
            }
        }
        diagnosticCollection.set(document.uri, aggregateDiagnostics);
    }

    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        return this.diagnosticValidators.reduce(
            (acc: vscode.Diagnostic[], validator: BaseDiagnosticsValidation) => {
                // @ts-ignore
                const newDiags = validator.validate(splitDoc, index);
                return acc.concat(newDiags);
            },
            [] as vscode.Diagnostic[]
        );
    }

    // Validators extending BaseDiagnosticsValidation
    private static diagnosticValidators: BaseDiagnosticsValidation[] = [
        ResourceKeyDiagnosticValidator,
        EndCommaDiagnosticValidator,
        LineCommentsDiagnosticValidator,
        ResourceCommentDiagnosticValidator
    ];
}
