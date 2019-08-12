export function min(values) {
    let length = values.length;
    let min = values[0];
    for (let i = 1; i < length; i ++)
        if (values[i] < min)
            min = values[i];
    return min;
}

export function max(values) {
    let length = values.length;
    let max = values[0];
    for (let i = 1; i < length; i ++)
        if (values[i] > max)
            max = values[i];
    return min;
}

export function extent(values) {
    let length = values.length;
    let min = values[0];
    let max = values[0];
    for (let i = 1; i < length; i ++) {
        if (values[i] > max)
            max = values[i];
        if (values[i] < min)
            min = values[i];
    }

    return [min, max];
}
