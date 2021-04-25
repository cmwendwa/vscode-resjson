import { IndentOptions } from '../models/index';
import { Transformer } from '../transformer';
import { BaseCommand } from './base';

export class ExpandCommand implements BaseCommand {
    /**
     * Run expand command
     * @param content
     */
    public static run(content: string, indentOptions: IndentOptions): string {
        return Transformer.expand(content, indentOptions);
    }
}
