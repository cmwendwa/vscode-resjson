import * as vscode from "vscode";
import { CodeLens, Command, Range } from "vscode";
import { Regexes } from "../constants/regexes";
import { isCommaMissing } from '../utils/comma-missing';
import { keyMissingComment } from "../utils/comment-missing";

export class ResJsonCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(
        document: vscode.TextDocument,
        _: vscode.CancellationToken
    ):
        vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const splitDoc = document.getText().split('\n');
        const codelens: CodeLens[] = [];

        for (let i = 0; i < splitDoc.length - 1; i++) {
            const line = splitDoc[i];
            const resourceQuery = Regexes.resourceKeyRegex.exec(line);
            const resourceKey = resourceQuery && resourceQuery[0];
            const restOfContent = splitDoc.slice(0, i).concat(
                splitDoc.slice(i + 1,)
            ).join('');

            if (isCommaMissing(line, splitDoc.slice(i + 1).join(''))) {
                const insertionLocation = new Range(i, line.search(/\S/), i, line.trim().length);
                const commaInsertiontLocation = new Range(i, 0, i, line.trimRight().length + 1);
                const c: Command = {
                    command: 'extension.insertLine',
                    title: 'Insert comma',
                    arguments: [
                        line.trimRight() + ',',
                        commaInsertiontLocation
                    ]
                };
                codelens.push(new CodeLens(insertionLocation, c));
            }

            const value = line.split(/:(.+)/)[1];
            if (resourceKey && keyMissingComment(
                resourceKey,
                value,
                restOfContent
            )) {
                const insertionLocation = new Range(i, line.search(/\S/), i, line.trim().length);
                const indent = line.split(/\S(,*)/)[0];
                const commentLocation = new Range(i + 1, 0, i + 1, 0);
                const addComma = line.trimRight().substr(-1) === ',';
                const comment = `${indent}"_${resourceKey}.comment": "$1"${addComma ? ',' : ''}\n`;

                const c: Command = {
                    command: 'extension.insertLine',
                    title: 'Insert comment below',
                    tooltip: 'This will insert a comment in the line below the resource.',
                    arguments: [
                        comment,
                        commentLocation
                    ]
                };
                codelens.push(new CodeLens(insertionLocation, c));
            }
        }

        return codelens;
    }
}
