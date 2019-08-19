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

export function range(min, max) {
    var size = Math.abs(max - min);
    var nums = new Array(size);
    for (let i = 0; i < size; i++)
        nums[i] = min + i;
    return nums;
}

// generates a color based on an index
export function indexToColor(index, valuesOnly) {
    const r = index >> 16;
    index -= r * 65536;

    const g = index >> 8;
    index -= g * 256;

    const b = index;
    return `rgb(${r}, ${g}, ${b})`;
}

export function colorToIndex(r, g, b) {
    return r * 65536 + g * 256 + b;
}