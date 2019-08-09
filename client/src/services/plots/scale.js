function getScale(inputRange, outputRange) {
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    const ratio = (outputMax - outputMin) / (inputMax - inputMin);
    return value => outputMin + ratio * (value - inputMin) ;
}

function getTicks(min, max, numTicks) {
    numTicks = numTicks || 10;

    let ticks = new Array(numTicks)
    let interval = (max - min) / (numTicks - 1);
    for (let i = 0; i < numTicks; i ++)
        ticks[i] = min + i * interval;

    return ticks;
}