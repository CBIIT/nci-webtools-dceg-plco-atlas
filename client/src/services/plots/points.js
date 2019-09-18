import { indexToColor } from './utils.js';

export function drawPoints(config, ctx, hiddenCtx) {
  const data = config.data;
  const margins = config.margins;
  const xKey = config.xAxis.key;
  const yKey = config.yAxis.key;
  const xScale = config.xAxis.scale;
  const yScale = config.yAxis.scale;
  const [xMin, xMax] = config.xAxis.extent;
  const [yMin, yMax] = config.yAxis.extent;

  ctx.save();
  hiddenCtx.save();

  // translate scatter points by left/top margin
  ctx.translate(margins.left, margins.top);
  hiddenCtx.translate(margins.left, margins.top);

  // draw points on canvas and backing canvas
  const pointSize = config.point.size;
  const pointColor = config.point.color;
  const interactivePointSize = config.point.interactiveSize || pointSize;
  ctx.globalAlpha = config.point.opacity;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const dx = d[xKey];
    const dy = d[yKey];

    if (dx < xMin || dx > xMax || dy < yMin || dy > yMax) continue;

    const x = xScale(dx);
    const y = yScale(dy);

    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, 2 * Math.PI, true);
    ctx.fillStyle =
      typeof pointColor === 'function' ? pointColor(d, i) : pointColor;
    ctx.fill();

    hiddenCtx.beginPath();
    hiddenCtx.arc(x, y, pointSize + 1, 0, 2 * Math.PI, true);
    const hiddenPointColor = indexToColor(i);
    hiddenCtx.fillStyle = hiddenPointColor;
    config.pointMap[hiddenPointColor] = d;
    hiddenCtx.fill();
  }
  ctx.restore();
  hiddenCtx.restore();
}


export function drawMirroredPoints(config, ctx, hiddenCtx) {
  const data = config.data;
  const margins = config.margins;
  const xKey = config.xAxis.key;
  const yKey = config.yAxis.key;
  const xScale = config.xAxis.scale;
  const yScale = config.yAxis.scale;
  const xScale2 = config.xAxis2.scale;
  const yScale2 = config.yAxis2.scale;
  const [xMin, xMax] = config.xAxis.extent;
  const [yMin, yMax] = config.yAxis.extent;

  ctx.save();
  hiddenCtx.save();

  // translate scatter points by left/top margin
  ctx.translate(margins.left, margins.top);
  hiddenCtx.translate(margins.left, margins.top);

  // draw points on canvas and backing canvas
  const pointSize = config.point.size;
  const pointColor = config.point.color;
  const interactivePointSize = config.point.interactiveSize || pointSize;
  ctx.globalAlpha = config.point.opacity;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const dx = d[xKey];
    const dy = d[yKey];

    if (dx < xMin || dx > xMax || dy < yMin || dy > yMax) continue;

    let x = xScale(dx);
    let y = yScale(dy);

    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, 2 * Math.PI, true);
    ctx.fillStyle =
      typeof pointColor === 'function' ? pointColor(d, i) : pointColor;
    ctx.fill();

    x = xScale2(dx);
    y = yScale2(dy);

    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, 2 * Math.PI, true);
    ctx.fillStyle =
      typeof pointColor === 'function' ? pointColor(d, i) : pointColor;
    ctx.fill();

  }
  ctx.restore();
  hiddenCtx.restore();
}
