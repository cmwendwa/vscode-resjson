import { IndentOptions } from "../models/index";

export class BaseCommand {
    public static run(content: string, _: IndentOptions): string {
        return content;
    }
}
