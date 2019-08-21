import { systemFont, renderText, measureWidth } from './text';

const min = array => array.reduce((acc, curr) => (curr < acc ? curr : acc));
const max = array => array.reduce((acc, curr) => (curr > acc ? curr : acc));

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {*} config
 */
export function axisLeft(canvas, config) {
  let font = config.font || systemFont;
  let { xOffset, yOffset, scale, tickValues, tickSize } = config;
  tickSize = tickSize || 6;
  tickValues = tickValues || scale.ticks();
  let interpolatedTickValues = tickValues.map(
    (val, idx, arr) => (val + (idx > 0 ? arr[idx - 1] : 0)) / 2
  );

  let yCoords = tickValues.map(scale);
  let padding = 2;

  const context = canvas.getContext('2d');
  context.translate((xOffset || 0) - tickSize - padding, yOffset || 0);
  context.fillStyle = '#444';
  context.font = '600 10px ' + font;
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.globalAlpha = 0.5;

  context.fillRect(tickSize, 0, 1, scale(tickValues[0]));
  yCoords.forEach((yCoord, i) => {
    context.globalAlpha = 0.5;
    context.fillRect(0, yCoord, tickSize, 1);
    context.globalAlpha = 1;
    context.fillText(tickValues[i], -padding, yCoord + 2);
  });

  context.save();

  let title = config.title || 'Y Axis';
  let titleWidth = measureWidth(context, title);

  const midpoint = scale((min(tickValues) + max(tickValues)) / 2);
  context.rotate((90 * Math.PI) / 180);
  context.font = '600 14px ' + font;
  context.translate(midpoint - titleWidth / 2, tickSize * 2 + padding * 5);
  context.textAlign = 'center';

  renderText(context, title);

  //  context.fillText(config.title || 'Y Axis', 0, 0);

  context.restore();
  context.setTransform(1, 0, 0, 1, 0, 0);
}

export function axisBottom(canvas, config) {
  let font = config.font || systemFont;
  let { xOffset, yOffset, scale, tickValues, tickSize, tickFormat } = config;
  tickSize = tickSize || 6;
  tickValues = tickValues || scale.ticks();
  let interpolatedTickValues = tickValues.map(
    (val, idx, arr) => (val + (idx > 0 ? arr[idx - 1] : 0)) / 2
  );

  let coords = tickValues.map(scale);
  let padding = 2;

  const context = canvas.getContext('2d');
  context.translate(xOffset || 0, yOffset || 0);
  context.fillStyle = '#444';
  context.font = '600 10px ' + font;
  context.textAlign = 'center';
  context.textBaseline = 'top';
  context.globalAlpha = 0.5;

  context.fillRect(0, 0, scale(max(tickValues)), 1);
  coords.forEach((coord, i) => {
    context.globalAlpha = 0.5;
    context.fillRect(coord, 0, 1, tickSize);
    const label = tickFormat ? tickFormat(tickValues[i], i) : tickValues[i];
    const labelOffset = config.labelsBetweenTicks
      ? scale(interpolatedTickValues[i])
      : coord;
      context.globalAlpha = 1;
      context.fillText(label, labelOffset + 1, padding + tickSize);
  });

  const midpoint = scale(max(tickValues) / 2);

  context.font = '600 14px ' + font;
  context.fillText(config.title || 'X Axis', midpoint, padding + 25);

  context.setTransform(1, 0, 0, 1, 0, 0);
}
