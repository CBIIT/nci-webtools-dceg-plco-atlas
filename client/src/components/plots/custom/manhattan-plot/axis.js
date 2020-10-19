import { renderText, measureWidth, scaleTextDefs } from '../text.js';
import { interpolateTicks } from './scale.js';
import * as clone from 'lodash.clonedeep';

export function axisLeft(config, ctx) {
  const margins = config.margins;
  const [xMin] = config.xAxis.extent;
  const [yMin, yMax] = config.yAxis.extent;
  const xScale = config.xAxis.scale;
  const yScale = config.yAxis.scale;
  let yScale2;
  if (config.yAxis2) yScale2 = config.yAxis2.scale;

  let axisWidth = config.xAxis.width || 1;
  let title = scaleTextDefs(config.yAxis.title || 'Y Axis', config.scaleSize || 1);
  let ticks = config.yAxis.ticks;
  let interpolatedTicks = interpolateTicks(ticks);
  let labelsBetweenTicks = config.yAxis.labelsBetweenTicks;
  let tickFormat = config.yAxis.tickFormat;
  let tickLength = 10 * Math.ceil(config.scaleSize || 1);
  let labelPadding = 20 * Math.ceil(config.scaleSize || 1);
  let maxLabelWidth = 0;

  ctx.save();
  ctx.globalAlpha = 0.5;

  ctx.translate(margins.left, margins.top);

  // draw axis line
  ctx.fillRect(
    xScale(xMin),
    yScale(yMin),
    axisWidth * Math.ceil(config.scaleSize || 1),
    yScale(yMax) - yScale(yMin)
  );

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  // draw each tick and its label
  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i];
    const y = yScale(tick);
    const yInterpolated = yScale(interpolatedTicks[i]);

    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, y, -tickLength, 1 * Math.ceil(config.scaleSize || 1));

    ctx.globalAlpha = 1;
    let label = tickFormat ? tickFormat(tick, i) : tick;
    let labelOffset = labelsBetweenTicks ? yInterpolated : y;

    label = scaleTextDefs(label, config.scaleSize || 1, {
      textAlign: 'right',
      textBaseline: 'middle',
    });

    ctx.save();
    ctx.translate(-tickLength - 2, labelOffset + 1)
    renderText(ctx, label);
    ctx.restore();

    // ctx.fillText(label, -tickLength - 2, labelOffset + 1);

    // update maximum tick label width (for determining title offset)
    maxLabelWidth = Math.max(maxLabelWidth, measureWidth(ctx, label));
  }

  if (yScale2) {
    // draw axis line
    ctx.globalAlpha = 0.5;

    ctx.fillRect(
      xScale(xMin),
      yScale2(yMin),
      axisWidth * Math.ceil(config.scaleSize || 1),
      yScale2(yMax) - yScale2(yMin)
    );

    for (let i = 0; i < ticks.length; i++) {
      const tick = ticks[i];
      const y = yScale2(tick);

      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, y, -tickLength, 1 * Math.ceil(config.scaleSize || 1));

      ctx.globalAlpha = 1;
      let label = tickFormat ? tickFormat(tick, i) : tick;
      let labelOffset = y;

      label = scaleTextDefs(label, config.scaleSize || 1, {
        textAlign: 'right',
        textBaseline: 'middle',
      });

      ctx.save();
      ctx.translate(-tickLength - 2, labelOffset + 1)
      renderText(ctx, label);
      ctx.restore();

      // ctx.fillText(label, -tickLength - 2, labelOffset + 1);

      // update maximum tick label width (for determining title offset)
      maxLabelWidth = Math.max(maxLabelWidth, measureWidth(ctx, label));
    }
  }

  if (config.mirrored) {
    if (title) {
      ctx.save();
      ctx.translate(0, yScale2(yMin) / 2);
      let titleWidth = measureWidth(ctx, title);
      let midpoint = (yScale(yMax) - yScale(yMin)) / 2;
      ctx.rotate(Math.PI / -2);
      ctx.translate(
        midpoint - titleWidth / 2,
        -(tickLength + labelPadding + maxLabelWidth) 
      );
      ctx.textAlign = 'center';
      renderText(ctx, title);
      ctx.restore();
    }

    if (config.yAxis.secondaryTitle) {
      let secondaryTitle = scaleTextDefs(config.yAxis.secondaryTitle, config.scaleSize || 1, {
        textAlign: 'center'
      });
      ctx.save();
      let titleWidth = measureWidth(ctx, title);
      let midpoint = (yScale(yMax) - yScale(yMin)) / 2;
      ctx.rotate(Math.PI / -2);
      ctx.translate(
        midpoint - titleWidth / 2,
        -(tickLength + labelPadding + maxLabelWidth) 
      );
      ctx.textAlign = 'center';
      renderText(ctx, secondaryTitle);
      ctx.restore();
    }

    if (config.yAxis2.secondaryTitle) {
      let secondaryTitle = scaleTextDefs(config.yAxis2.secondaryTitle, config.scaleSize || 1, {
        textAlign: 'center'
      });
      ctx.save();
      ctx.translate(0, yScale2(yMin));
      let titleWidth = measureWidth(ctx, title);
      let midpoint = (yScale(yMax) - yScale(yMin)) / 2;
      ctx.rotate(Math.PI / -2);
      ctx.translate(
        midpoint - titleWidth / 2,
        -(tickLength + labelPadding + maxLabelWidth) 
      );
      ctx.textAlign = 'center';
      renderText(ctx, secondaryTitle);
      ctx.restore();
    }
  } else {
    // draw axis title (rotated -90 degrees)
    let titleWidth = measureWidth(ctx, title);
    let midpoint = (yScale(yMax) - yScale(yMin)) / 2;
    ctx.rotate(Math.PI / -2);
    ctx.translate(
      midpoint - titleWidth / 2,
      -(tickLength + maxLabelWidth + labelPadding)
    );
    ctx.textAlign = 'center';
    renderText(ctx, title);
  }

  ctx.restore();
}

export function axisBottom(config, ctx) {
  // console.log('drawing axis', clone(config), ctx);
  const margins = config.margins;
  const [xMin, xMax] = config.xAxis.extent;
  const [yMin, yMax] = config.yAxis.extent;

  let xScale = config.xAxis.scale;
  if (config.xAxis2) {
    xScale = config.xAxis2.scale;
  }

  let yScale = config.yAxis.scale;
  if (config.yAxis2) {
    yScale = config.yAxis2.scale;
  }

  let axisWidth = (config.yAxis.width || 1) *  Math.ceil(config.scaleSize || 1);
  let title = config.xAxis.title;
  let ticks = config.xAxis.ticks;
  let interpolatedTicks = interpolateTicks(ticks);
  let labelsBetweenTicks = config.xAxis.labelsBetweenTicks;
  let tickFormat = config.xAxis.tickFormat;
  let tickPadding = 10 * Math.ceil(config.scaleSize || 1);
  let tickLength = 10 * Math.ceil(config.scaleSize || 1);
  let labelPadding = 20;

  ctx.save();
  ctx.globalAlpha = 0.5;

  ctx.translate(
    margins.left,
    margins.top + (config.yAxis2 ? yScale(yMax) : yScale(yMin))
  );

  // draw axis line
  ctx.fillRect(xScale(xMin), 0, xScale(xMax) - xScale(xMin) + 3, axisWidth);

  // remove tick 0 if defined, and labelsBetweenTicks is true
  if (labelsBetweenTicks && interpolatedTicks[0] == 0)
    interpolatedTicks.shift();

  // draw each tick (do not use forEach to avoid creating new scopes)
  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i];
    const x = xScale(tick);
    const xInterpolated = xScale(interpolatedTicks[i]);

    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, 0, axisWidth, tickLength);

    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    let label = tickFormat ? tickFormat(tick, i) : tick;
    let labelOffset = labelsBetweenTicks ? xInterpolated : x;
    let showLabel = !isNaN(label) || typeof label === 'string';

    label = scaleTextDefs(label, config.scaleSize || 1, {
      textAlign: 'center',
    });

    ctx.save();
    ctx.translate(labelOffset, tickLength + tickPadding);
    showLabel && renderText(ctx, label);
    ctx.restore();


    // ctx.fillText(label, labelOffset, tickLength + tickPadding);
  }

  // draw axis title
  if (title) {
    let titleWidth = measureWidth(ctx, title);
    let midpoint = (xScale(xMax) - xScale(xMin)) / 2;
    ctx.translate(
      midpoint - titleWidth / 2,
      tickLength + tickPadding + labelPadding
    );
    ctx.textAlign = 'center';
    renderText(ctx, title);
  }

  ctx.restore();
}
