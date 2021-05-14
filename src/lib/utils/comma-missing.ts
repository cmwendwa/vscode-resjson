export function isCommaMissing(currentLine: string, remainingContent: string): boolean {
    const lastChar = currentLine.trim().substr(-1);
    return !isLastLine(remainingContent) && !!currentLine.trim() && !!lastChar && lastChar !== ',' && lastChar !== '{';
}

function isLastLine(remainingContent: string): boolean {
    return !remainingContent.trim() || remainingContent.startsWith('}');
}
