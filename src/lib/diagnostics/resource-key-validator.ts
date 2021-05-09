import { BaseDiagnosticsValidation } from "./base-diagnostic-validator";
import * as vscode from "vscode";
import { Regexes } from "../constants/regexes";
import { Strings } from '../../resources/res-strings';
import { Diagnostic } from "vscode";
import { keyMissingComment } from '../utils/comment-missing';

export class ResourceKeyDiagnosticValidator extends BaseDiagnosticsValidation {
    public static validate(splitDoc: string[], index: number): vscode.Diagnostic[] {
        const line = splitDoc[index];
        const diagnostics: vscode.Diagnostic[] = [];

        if (!line.trim()) {
            return diagnostics;
        }

        const resourceQuery = Regexes.resourceKeyRegex.exec(line);
        const resourceKey = resourceQuery && resourceQuery[0];
        const restOfContent = splitDoc.slice(0, index).concat(
            splitDoc.slice(index + 1,)
        ).join('');

        if (resourceKey?.length === 0) {
            const emptyKeyMatchDiag: vscode.Diagnostic = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(
                        index, line.search(/\S/)
                    ),
                    new vscode.Position(index, line.length)
                ),
                Strings.diagnosticMessages.resourceKeyEmptyError,
                vscode.DiagnosticSeverity.Error,
            );
            diagnostics.push(emptyKeyMatchDiag);
        } else if(resourceKey) {
            this.validateKeyNeedingComment(
                resourceKey,
                restOfContent,
                line,
                index,
                diagnostics
            );
            if(this.keyHasMatchingResource(resourceKey, restOfContent)) {
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
        } else if(!(
            Regexes.resourceCommentKeyRegex.test(line) ||
            Regexes.resourceCommentLikeRegex1.test(line) ||
            Regexes.resourceCommentLikeRegex2.test(line) ||
            Regexes.resourceCommentLikeRegex3.test(line) ||
            Regexes.lineCommentRegex.test(line) ||
            Regexes.lineCommentLikeRegex.test(line) ||
            ['}', '{'].includes(line.trim())
        )) {
            const invalidKeyDiag: vscode.Diagnostic = new vscode.Diagnostic(
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
            diagnostics.push(invalidKeyDiag);
        }

        return diagnostics;
    }

    private static keyHasMatchingResource(resourceKey: string, restOfContent: string): boolean {
        const resourceRegex = new RegExp(`"${resourceKey}"\\s*`);
        return resourceRegex.test(restOfContent);
    }

    private static validateKeyNeedingComment(
        resourceKey: string,
        restOfContent: string,
        line: string,
        index: number,
        diagnostics: Diagnostic[]
    ) {
        const value = line.split(/:(.+)/)[1];

        if (keyMissingComment(
            resourceKey,
            value,
            restOfContent
        )) {
            const missingCommentKeyDiag: vscode.Diagnostic = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(
                        index, line.search(/\S/)
                    ),
                    new vscode.Position(index, line.length)
                ),
                'The variables({...}) in your resource can use some comments',
                vscode.DiagnosticSeverity.Warning
            );

            diagnostics.push(missingCommentKeyDiag);
        }
    }
}
