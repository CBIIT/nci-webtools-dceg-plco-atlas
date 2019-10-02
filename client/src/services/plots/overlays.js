import { viewportToLocalCoordinates } from './utils.js';
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
  if (ticks[0] != 0) ticks.unshift(0);

  canvas.removeEventListener('mousemove', drawOverlay);
  canvas.addEventListener('click', selectOverlay);

  canvas.addEventListener('mousemove', drawOverlay);
  canvas.addEventListener('click', selectOverlay);

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

export function drawMirroredZoomOverlay(config, ctx, overlayCtx) {
  let canvas = ctx.canvas;
  let margins = config.margins;
  let width = canvas.width - margins.left - margins.right;
  let height = canvas.height - margins.top - margins.bottom;
  let zoomArea = { x1: 0, x2: 0, y1: 0, y2: 0 };
  let mouseDown = false;

  function startZoom() {

  }

  function updateZoomWindow() {

  }

  function endZoom() {

  }
}

export function drawZoomOverlay(config, ctx, overlayCtx) {
  let canvas = ctx.canvas;
  let margins = config.margins;
  let width = canvas.width - margins.left - margins.right;
  let height = canvas.height - margins.top - margins.bottom;
  let zoomArea = { x1: 0, x2: 0, y1: 0, y2: 0 };
  let mouseDown = false;

  // remove previously attached event listeners
  canvas.removeEventListener('mousedown', startZoom);
  canvas.removeEventListener('mousemove', updateZoomWindow);
  canvas.removeEventListener('mouseup', endZoom);
  canvas.removeEventListener('dblclick', resetZoom);

  canvas.addEventListener('mousedown', startZoom);
  canvas.addEventListener('mousemove', updateZoomWindow);
  canvas.addEventListener('mouseup', endZoom);
  canvas.addEventListener('dblclick', resetZoom);

  //
  config.zoomOverlayActive = false;

  function startZoom(ev) {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );
    let withinMargins = isWithinMargins(x, y, canvas, margins);
    zoomArea = { x1: x, x2: x, y1: y, y2: y };
    if (!withinMargins) return false;
    mouseDown = true;
    config.zoomOverlayActive = true;
  }

  function updateZoomWindow(ev) {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );
    let dx = Math.abs(x - zoomArea.x1);
    let dy = Math.abs(y - zoomArea.y1);
    if (!mouseDown || dx * dy < 100)
      return false;

    zoomArea.x2 = x;
    zoomArea.y2 = y;

    overlayCtx.globalAlpha = 0.5;
    overlayCtx.clearRect(margins.left, margins.top, width, height);
    overlayCtx.fillRect(margins.left, margins.top, width, height);
    overlayCtx.clearRect(
      Math.min(zoomArea.x1, zoomArea.x2),
      Math.min(zoomArea.y1, zoomArea.y2),
      Math.abs(zoomArea.x2 - zoomArea.x1),
      Math.abs(zoomArea.y2 - zoomArea.y1)
    );
  }

  function endZoom(ev) {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );
    overlayCtx.clearRect(margins.left, margins.top, width, height);
    config.zoomOverlayActive = false;
    mouseDown = false;
    zoomArea.x2 = x;
    zoomArea.y2 = y;

    // order coordinates so that x1 < x2, y2 < y2, and subtract margins
    let x1 = Math.min(zoomArea.x1, zoomArea.x2) - margins.left; // left value (xMin)
    let y1 = Math.min(zoomArea.y1, zoomArea.y2) - margins.top; // top value (yMax)
    let x2 = Math.max(zoomArea.x1, zoomArea.x2) - margins.left; // right value (xMax)
    let y2 = Math.max(zoomArea.y1, zoomArea.y2) - margins.top; // bottom value (yMin)
    if ((x2 - x1) * (y2 - y1) < 100) return false;

    // make sure coordinates are within bounds
    x1 = Math.max(x1, 0);
    y1 = Math.max(y1, 0);
    x2 = Math.min(x2, width);
    y2 = Math.min(y2, height);

    // apply inverse scales to determine original data bounds
    let xInverseScale = getScale([0, width], config.xAxis.extent);
    let yInverseScale = getScale([height, 0], config.yAxis.extent);
    let xMin = xInverseScale(x1);
    let xMax = xInverseScale(x2);
    let yMax = yInverseScale(y1);
    let yMin = yInverseScale(y2);

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
