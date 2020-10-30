import {
  viewportToLocalCoordinates,
  addEventListener,
  withSavedContext,
  extent
} from '../utils.js';
import { renderText, systemFont } from '../text.js';
import { getScale } from './scale.js';

export function drawSelectionOverlay(config, ctx, overlayCtx) {
  let canvas = ctx.canvas;
  let overlayCanvas = overlayCtx.canvas;
  overlayCtx.globalAlpha = 0.1;

  let xScale = config.xAxis.scale;
  let xInverseScale = config.xAxis.inverseScale;
  let margins = config.margins;
  let ticks = config.xAxis.ticks;
  let selectedBounds = null;
  if (+ticks[0] !== 0) ticks.unshift(0);

  canvas.removeEventListener('mousemove', drawOverlay);
  canvas.removeEventListener('click', selectOverlay);

  addEventListener(canvas, 'mousemove', drawOverlay);
  addEventListener(canvas, 'click', selectOverlay);

  function drawOverlay(ev) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );
    let scaledX = xInverseScale(x - margins.left);
    let withinMargins = isWithinMargins(x, y, canvas, margins);
    selectedBounds = getSectionBounds(scaledX, ticks);

    if (withinMargins && selectedBounds) {
      let xPosition = xScale(selectedBounds[0]);
      let width = xScale(selectedBounds[1] - selectedBounds[0]);
      let height =
        overlayCanvas.height - config.margins.bottom - config.margins.top;
      overlayCtx.fillRect(
        1 + margins.left + xPosition,
        margins.top,
        width,
        height
      );
    }
  }

  function selectOverlay(ev) {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );
    let withinMargins = isWithinMargins(x, y, canvas, margins);
    if (withinMargins && selectedBounds && config.xAxis.onSelected)
      config.xAxis.onSelected(selectedBounds, ticks.indexOf(selectedBounds[0]));
  }
}

export function drawZoomOverlay(config, ctx, overlayCtx) {
  let canvas = ctx.canvas;
  let margins = config.margins;
  let width = canvas.width - margins.left - margins.right;
  let height = canvas.height - margins.top - margins.bottom;
  let zoomArea = { x1: 0, x2: 0, y1: 0, y2: 0 };
  let mouseDown = false;
  let body = window.document.body;

  // remove previously attached event listeners

  canvas.removeEventListener('mousedown', startZoom);
  canvas.removeEventListener('mousemove', updateZoomWindow);
  body.removeEventListener('mouseup', endZoom);
  // canvas.removeEventListener('dblclick', resetZoom);

  addEventListener(canvas, 'mousedown', startZoom);
  addEventListener(canvas, 'mousemove', updateZoomWindow);
  addEventListener(body, 'mouseup', endZoom);
  // addEventListener(canvas, 'dblclick', resetZoom);

  //
  config.zoomOverlayActive = false;

  function startZoom(ev) {
    if (ev.button !== 0) return;
    let { x, y } = viewportToLocalCoordinates(ev.clientX, ev.clientY, canvas);
    let withinMargins = isWithinMargins(x, y, canvas, margins);
    zoomArea = { x1: x, x2: x, y1: y, y2: y };
    if (!withinMargins) return false;
    mouseDown = true;
    config.zoomOverlayActive = true;
  }

  function updateZoomWindow(ev) {
    let { x, y } = viewportToLocalCoordinates(ev.clientX, ev.clientY, canvas);
    let dx = Math.abs(x - zoomArea.x1);
    let dy = Math.abs(y - zoomArea.y1);
    let createRect = zoomArea => ({
      x: Math.min(zoomArea.x1, zoomArea.x2),
      y: Math.min(zoomArea.y1, zoomArea.y2),
      width: Math.abs(zoomArea.x2 - zoomArea.x1),
      height: Math.abs(zoomArea.y2 - zoomArea.y1),
      direction: zoomArea.y2 > zoomArea.y1 ? -1 : 1
      // 1 for drawing upwards, -1 for drawing downwards
    });
    let mirrorValue = (val, mid) => {
      var dist = Math.abs(mid - val);
      return val < mid ? mid + dist : mid - dist;
    };

    if (!mouseDown || dx * dy < 100) return false;

    zoomArea.x2 = x;
    zoomArea.y2 = y;
    let rect = createRect(zoomArea);
    overlayCtx.globalAlpha = 0.5;
    overlayCtx.clearRect(margins.left, margins.top, width, height);
    overlayCtx.fillRect(margins.left, margins.top, width, height);

    if (config.mirrored) {
      // limit drawable area to midpoint
      let yMidpoint = margins.top + height / 2;
      if (zoomArea.y1 < yMidpoint) {
        zoomArea.y1 = Math.min(zoomArea.y1, yMidpoint);
        zoomArea.y2 = Math.min(zoomArea.y2, yMidpoint);
      } else {
        zoomArea.y1 = Math.max(zoomArea.y1, yMidpoint);
        zoomArea.y2 = Math.max(zoomArea.y2, yMidpoint);
      }
      let rect = createRect(zoomArea);
      let yMirrored = mirrorValue(
        Math.max(zoomArea.y1, zoomArea.y2),
        yMidpoint
      );
      overlayCtx.clearRect(rect.x, rect.y, rect.width, rect.height);
      overlayCtx.clearRect(rect.x, yMirrored, rect.width, rect.height);
    } else {
      overlayCtx.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  function endZoom(ev) {
    if (!mouseDown) return;
    if (Math.abs(zoomArea.x2 - zoomArea.x1) < 5 && Math.abs(zoomArea.y2 - zoomArea.y1) < 5) {
      mouseDown = false;
      config.zoomOverlayActive = false;
      return;
    }
    let { x, y } = viewportToLocalCoordinates(ev.clientX, ev.clientY, canvas);

    let yMidpoint = margins.top + height / 2;
    overlayCtx.clearRect(margins.left, margins.top, width, height);
    config.zoomOverlayActive = false;
    mouseDown = false;

    let zoomPadding = 10;

    // order coordinates so that x1 < x2, y2 < y2, and subtract margins
    let x1 = Math.min(zoomArea.x1, zoomArea.x2) - margins.left - zoomPadding; // left value (xMin)
    let x2 = Math.max(zoomArea.x1, zoomArea.x2) - margins.left + zoomPadding; // right value (xMax)

    let y1 = Math.min(zoomArea.y1, zoomArea.y2) - margins.top - zoomPadding; // top value (yMax)
    let y2 = Math.max(zoomArea.y1, zoomArea.y2) - margins.top + zoomPadding; // bottom value (yMin)
    if ((x2 - x1) * (y2 - y1) < 100) return false;

    // make sure coordinates are within bounds
    x1 = Math.max(x1, 0);
    y1 = Math.max(y1, 0);
    x2 = Math.min(x2, width);
    y2 = Math.min(y2, height);

    // apply inverse scales to determine original data bounds
    let xInverseScale = getScale([0, width], config.xAxis.extent);
    let yInverseScale = getScale([height, 0], config.yAxis.extent);
    if (config.mirrored) {
      yInverseScale =
        zoomArea.y1 < yMidpoint
          ? getScale([height / 2, 0], config.yAxis.extent)
          : getScale([height / 2, height], config.yAxis.extent);
    }

    let xMin = xInverseScale(x1);
    let xMax = xInverseScale(x2);
    let yMax, yMin;

    if (config.mirrored) {
      yMin = zoomArea.y1 > yMidpoint ? yInverseScale(y1) : yInverseScale(y2);
      yMax = zoomArea.y1 > yMidpoint ? yInverseScale(y2) : yInverseScale(y1);
    } else {
      yMin = yInverseScale(y2);
      yMax = yInverseScale(y1);
    }

    const window = {
      coordinates: { x1, x2, y1, y2 },
      bounds: { xMin, xMax, yMin, yMax }
    };

    if (config.setZoomWindow) {
      config.zoomStack.push(window);
      config.setZoomWindow(window);
    }
  }

  function resetZoom(ev) {
    config.resetZoom && config.resetZoom();
  }

  function zoomOut(ev) {
    config.zoomOut && config.zoomOut();
  }
}

export function drawPanOverlay(config, ctx, overlayCtx) {
  let canvas = ctx.canvas;
  let margins = config.margins;
  let width = canvas.width - margins.left - margins.right;
  let height = canvas.height - margins.top - margins.bottom;
  let panArea = {
    xStart: 0,
    xEnd: 0,
    yStart: 0,
    yEnd: 0,
    deltaX: 0,
    deltaY: 0
  };
  let mouseDown = false;
  let body = window.document.body;
  let xScale, yScale;
  let limits = {
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0
  };

  addEventListener(canvas, 'contextmenu', ev => {
    ev.preventDefault();
  });

  addEventListener(canvas, 'mousedown', ev => {
    if (ev.button !== 2 || config.zoomAreaActive || !config.zoomWindow) return;
    let currentBounds = config.zoomWindow.bounds;

    const xData = config.data.map(d => d[config.xAxis.key]);
    const yData = config.data.map(d => d[config.yAxis.key]);
    const yData2 = config.data2
      ? config.data2.map(d => d[config.yAxis.key])
      : [];

    let xExtent = extent(xData);
    let yExtent = extent(yData.concat(yData2));

    limits = {
      xMin: xExtent[0],
      xMax: xExtent[1],
      yMin: yExtent[0],
      yMax: yExtent[1]
    };

    xScale = getScale([0, width], [0, currentBounds.xMax - currentBounds.xMin]);

    yScale = getScale(
      [0, height],
      [0, currentBounds.yMax - currentBounds.yMin]
    );

    mouseDown = true;
    canvas.style.cursor = 'move';
    let { x, y } = viewportToLocalCoordinates(ev.clientX, ev.clientY, canvas);
    panArea.xStart = x;
    panArea.yStart = y;
  });

  addEventListener(canvas, 'mousemove', ev => {
    if (!mouseDown) return;
    canvas.style.cursor = 'move';
    let currentBounds = config.zoomWindow.bounds;
    let { x, y } = viewportToLocalCoordinates(ev.clientX, ev.clientY, canvas);
    panArea.xEnd = x;
    panArea.yEnd = y;
    panArea.deltaX = xScale(panArea.xEnd - panArea.xStart);
    panArea.deltaY = -yScale(panArea.yEnd - panArea.yStart); // inverse y scale

    if (currentBounds.xMin + panArea.deltaX < limits.xMin) {
      panArea.deltaX = limits.xMin - currentBounds.xMin;
    }

    if (currentBounds.xMax + panArea.deltaX > limits.xMax) {
      panArea.deltaX = limits.xMax - currentBounds.xMax;
    }

    if (currentBounds.yMin + panArea.deltaY < limits.yMin) {
      panArea.deltaY = limits.yMin - currentBounds.yMin;
    }

    if (currentBounds.yMax + panArea.deltaY > limits.yMax) {
      panArea.deltaY = limits.yMax - currentBounds.yMax;
    }

    withSavedContext(overlayCtx, ctx => {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#eee';
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      let center = {
        x: (config.margins.left + width) / 2,
        y: (config.margins.top + height) / 2
      };

      ctx.translate(center.x, center.y);
      let deltaX = (Math.abs(panArea.deltaX) / 1e6).toPrecision(4);
      let deltaY = Math.abs(panArea.deltaY).toPrecision(4);

      let titles = [
        `${panArea.deltaY > 0 ? '🡩' : '🡫'} ${deltaY} P`,
        `${panArea.deltaX > 0 ? '🡪' : '🡨'} ${deltaX} MB`
      ];

      if (panArea.deltaY < 0) titles = [titles[1], titles[0]];

      titles.forEach(title => {
        let size = 16;
        renderText(ctx, title, {
          font: `${size}px ${systemFont}`,
          //textAlign: 'center',
          textBaseline: 'center',
          fillStyle: 'black'
        });
        ctx.translate(0, size);
      });
    });
  });

  addEventListener(body, 'mouseup', ev => {
    if (!mouseDown) return;
    mouseDown = false;
    canvas.style.cursor = 'crosshair';
    let currentBounds = config.zoomWindow.bounds;
    let { deltaX, deltaY } = panArea;
    

    withSavedContext(overlayCtx, ctx => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });

    let bounds = {
      xMin: currentBounds.xMin + deltaX,
      xMax: currentBounds.xMax + deltaX,
      yMin: currentBounds.yMin + deltaY,
      yMax: currentBounds.yMax + deltaY
    };

    config.setZoomWindow({ bounds });
    if (config.onPan) {
      config.onPan(bounds);
    }
  });
}

function getSectionBounds(value, ticks) {
  for (let i = 0; i < ticks.length - 1; i++) {
    let pair = [ticks[i], ticks[i + 1]];
    if (value >= pair[0] && value <= pair[1]) return pair;
  }
  return null;
}

function isWithinMargins(x, y, canvas, margins) {
  return (
    x > margins.left &&
    x < canvas.width - margins.right &&
    y > margins.top &&
    y < canvas.height - margins.bottom
  );
}
