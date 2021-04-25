import { Formatter } from '../formatter';
import { IndentOptions } from '../models/index';
import { BaseCommand } from './base';
export class FormatCommand implements BaseCommand {
    /**
     * Run flatten command
     * @param content
     */
    public static run(content: string, indentOptions: IndentOptions): string {
        return Formatter.format(content, indentOptions);
    }
}
