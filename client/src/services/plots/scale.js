export function getScale(inputRange, outputRange) {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  const ratio = (outputMax - outputMin) / (inputMax - inputMin);
  return value => outputMin + ratio * (value - inputMin) ;
}

// extends a range by the nearest power of 10 (eg: 0.2, 1.5 -> 0, 2)
export function extendRange(range) {
  let [r0, r1] = range;
  return [r0, r1];
}

export function getTicks(min, max, numTicks) {
  numTicks = numTicks || 10;

  let ticks = new Array(numTicks);
  let interval = (max - min) / (numTicks - 1);
  for (let i = 0; i < numTicks; i ++)
      ticks[i] = min + i * interval;

  return ticks;
}

export function interpolateTicks(ticks) {
  return ticks.map((value, index, array) => {
    let previousValue = index > 0 ? array[index - 1] : 0;
    return (value + previousValue) / 2;
  });
}