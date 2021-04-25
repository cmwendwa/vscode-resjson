import { FlattenCommand } from './flatten';
import { FormatCommand } from './format';
import { ExpandCommand } from './expand';
import { IndentOptions, ResJsonCommands } from '../models/index';
import * as vscode from 'vscode';

export function runResJsonCommand(command: ResJsonCommands, content: string): string {
    const indentOptions: IndentOptions = {};
    if (vscode.window.activeTextEditor) {
        indentOptions.useSpaces = !!vscode.window.activeTextEditor.options.insertSpaces;
        indentOptions.tabSize = Number(vscode.window.activeTextEditor.options.tabSize);
    }

    switch (command) {
        case ResJsonCommands.Expand:
            return ExpandCommand.run(content, indentOptions);
        case ResJsonCommands.Flatten:
            return FlattenCommand.run(content, indentOptions);
        case ResJsonCommands.Format:
            return FormatCommand.run(content, indentOptions);
        default:
            throw new Error('Provided command option not known!');
    }
}
