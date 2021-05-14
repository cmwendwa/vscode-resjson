function keyNeedsComment(value: string): boolean{
    return !!value && /["'].*\{[\d\w]\}.*["']/.test(value);
}

function keyHasComment(key: string, restOfContent: string): boolean{
    return new RegExp(`"_${key}.comment"\\s*:`).test(restOfContent);
}

export function keyMissingComment(key: string, value: string, restOfcontent: string): boolean{
    return keyNeedsComment(value) && !keyHasComment(key, restOfcontent);
}
