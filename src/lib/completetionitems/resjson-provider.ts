import * as vscode from "vscode";

export class ResJsonCopletionItemsProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _: vscode.CancellationToken, __: vscode.CompletionContext) {
        const docText = document.getText();
        const currrentLine = document.lineAt(position.line);
        const currrrentText = currrentLine.text.substring(0, position.character).trim().substring(1);

        const rootRegex = new RegExp(`(?<="${currrrentText}).+(_.*)*(?="\s*:)`, 'gm');

        const suggestions: vscode.CompletionItem[] = [];
        const suggestionStrings: Set<string> = new Set();
        let result: RegExpExecArray | null;
        do {
            result = rootRegex.exec(docText);
            console.log('Result ****', result);
            if (result && result[0]) {
                const firstGroup = result[0] || '';
                const splitString = firstGroup.split('_');
                splitString.forEach(
                    (___, index) => {
                        const suggestion = currrrentText + splitString.slice(0, index + 1).join('_');
                        suggestionStrings.add(suggestion);
                    }
                );
            }
        } while (result);

        Array.from(suggestionStrings)
            .sort()
            .sort((a, b) => a.length - b.length)
            .forEach(suggestion => {
                suggestions.push(
                    new vscode.CompletionItem(suggestion)
                );
            });

        return suggestions;
    }
}
