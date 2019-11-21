export function min(values) {
  let length = values.length;
  let min = values[0];
  for (let i = 1; i < length; i++) if (values[i] < min) min = values[i];
  return min;
}

export function max(values) {
  let length = values.length;
  let max = values[0];
  for (let i = 1; i < length; i++) if (values[i] > max) max = values[i];
  return max;
}

export function extent(values) {
  let length = values.length;
  let min = values[0];
  let max = values[0];

  for (let i = 1; i < length; i++) {
    let value = values[i];
    if (value > max) max = value;
    if (value < min) min = value;
  }

  return [min, max];
}

export function range(min, max) {
  var size = Math.abs(max - min);
  var nums = new Array(size);
  for (let i = 0; i < size; i++) nums[i] = min + i;
  return nums;
}

export function debounce(callback, interval) {
  let id;
  return function() {
    if (id) clearTimeout(id);
    id = setTimeout(callback.bind(this, ...arguments), interval);
  };
}

// generates a color based on an index
// a multiplier is needed to account for anti-aliasing,
// which produces slightly different pixel colors at edges
// the index should be a number smaller than:
//  (2 ^ 24) / multiplier

/**
 * Generates a color based on a number, useful for assigning
 * elements in a canvas a unique color, so they can be selected
 * by color.
 */
export function indexToColor(index, multiplier) {
  multiplier = multiplier || 50;
  index = index * multiplier;
  const r = index >> 16;
  index -= r * 65536;

  const g = index >> 8;
  index -= g * 256;

  const b = index;
  return rgbToColor(r, g, b);
}

export function rgbToColor(r, g, b) {
  return `rgb(${r},${g},${b})`;
}

// converts a color (given r, g, b) to an index
export function colorToIndex(r, g, b, multiplier) {
  multiplier = multiplier || 50;
  return multiplier * (r * 65536 + g * 256 + b);
}

export function packRanges(ranges) {
  let rows = [];
  let MIN_INDEX = 0;
  let MAX_INDEX = 1;

  // determine highest filled value in row
  let highestIndex = row => (
    row.length > 0 ? row[row.length - 1][MAX_INDEX] : -1
  );

  // sort rows by min, then max
  let sortedRanges = [...ranges].sort((a, b) =>
    a[MIN_INDEX] - b[MIN_INDEX] ||
    a[MAX_INDEX] - b[MAX_INDEX]
  );

  for (let range of sortedRanges) {

    // determines if the range was inserted into an existing row
    let insertedRange = false;

    // look for a row where the highest range is below the current range
    // because ranges are sorted, they will be inserted top-down
    for (let row of rows) {
      if (!insertedRange && highestIndex(row) < range[MIN_INDEX]) {
        row.push(range);
        insertedRange = true;
      }
    }

    // if no valid rows could be found, insert the range into a new row
    if (!insertedRange)
      rows.push([range]);
  }

  return rows;
}


/**
 * Translates coordinates from the current viewport (eg: MouseEvent's clientX/Y)
 * to local coordinates within an element
 * @param {*} x
 * @param {*} y
 * @param {*} element
 */
export function viewportToLocalCoordinates(x, y, element) {
  const boundingRect = element.getBoundingClientRect(element);
  const style = getComputedStyle(element);

  const xOffset = Math.floor(
    boundingRect.left + parseInt(style.borderLeftWidth, 10)
  );

  const yOffset = Math.floor(
    boundingRect.top + parseInt(style.borderTopWidth, 10)
  );

  return {
    x: x - xOffset,
    y: y - yOffset
  };
}

export function createElement(tagName, props, children) {
  let el = document.createElement(tagName);
  for (let key in props || {}) el[key] = props[key];

  if (!Array.isArray(children)) children = [children];

  for (let child of children || []) {
    if (child.constructor === String) child = document.createTextNode(child);
    el.appendChild(child);
  }

  return el;
}
