


export function asTitleCase(snakeCase) {
    return snakeCase
        .replace(/_+/g, ' ')
        .replace(/\w+/g, word => word[0].toUpperCase() + word.substr(1).toLowerCase());
} 
