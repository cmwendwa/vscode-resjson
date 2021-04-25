import { IndentOptions } from "../models/index";

export class BaseCommand {
    public static run(content: string, indentOptions: IndentOptions): string {
        return content;
    }
}
