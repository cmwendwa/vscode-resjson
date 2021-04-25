import { IndentOptions } from '../models/index';
import { Transformer } from '../transformer';
import { BaseCommand } from './base';
export class FlattenCommand implements BaseCommand {
    /**
     * Run flatten command
     * @param content
     */
    public static run(content: string, indentOptions: IndentOptions): string {
        return Transformer.flatten(content, indentOptions);
    }
}
