import {
  debounce,
  extent,
  rgbToColor,
  viewportToLocalCoordinates
} from './utils.js';
import { getScale, getTicks } from './scale.js';
import { axisLeft, axisBottom } from './axis.js';
import { drawPoints } from './points.js';
import { drawSelectionOverlay, drawZoomOverlay } from './overlays.js';

export class ManhattanPlot {
  constructor(container, config) {
    const containerStyle = getComputedStyle(container);
    if (containerStyle.position === 'static')
      container.style.position = 'relative';
    this.container = container;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // create an overlay canvas to be used for selecting areas (zooming)
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.overlayCanvas.style.position = 'absolute';
    this.overlayCanvas.style.pointerEvents = 'none';
    this.overlayCanvas.style.top = '0';
    this.overlayCanvas.style.left = '0';

    // create a hidden canvas to be used for selecting points
    this.hiddenCanvas = document.createElement('canvas');
    this.hiddenCtx = this.hiddenCanvas.getContext('2d');

    this.config = config;
    if (this.config.xAxis.extent)
      this.config.xAxis.defaultExtent = this.config.xAxis.extent;
    if (this.config.yAxis.extent)
      this.config.yAxis.defaultExtent = this.config.yAxis.extent;
    this.tooltip = this.createTooltip();
    this.container.appendChild(this.canvas);
    this.container.appendChild(this.overlayCanvas);
    this.container.appendChild(this.tooltip);
    this.draw();

    this.attachEventHandlers(this.canvas);

    // allow either selection or zoom, but not both
    if (config.xAxis.allowSelection) {
      drawSelectionOverlay(config, this.ctx, this.overlayCtx);
    } else if (config.allowZoom) {
      config.zoomStack = config.zoomStack || [];
      drawZoomOverlay(config, this.ctx, this.overlayCtx);
      config.setZoomWindow = ev => {
        config.zoomWindow = ev;
        let { xMin, xMax, yMin, yMax } = ev.bounds;
        config.xAxis.extent = [xMin, xMax];
        config.yAxis.extent = [yMin, yMax];
        this.draw();
        if (config.onZoom)
          config.onZoom(config.zoomWindow);
      };
      config.zoomOut = ev => {
        let stack = config.zoomStack;
        if (stack.length < 2) {
          config.resetZoom();
        } else {
          // stack has the current zoom level, we need the previous level
          stack.pop();
          let window = stack[stack.length - 1];
          config.setZoomWindow(window);
        }
      };
      config.resetZoom = window => {
        const xData = config.data.map(d => d[config.xAxis.key]);
        const yData = config.data.map(d => d[config.yAxis.key]);
        config.xAxis.extent = config.xAxis.defaultExtent || extent(xData);
        config.yAxis.extent = config.yAxis.defaultExtent || extent(yData);
        config.zoomStack = [];
        this.draw();
        if (config.onZoom) {
          const [xMin, xMax] = config.xAxis.extent;
          const [yMin, yMax] = config.yAxis.extent;
          config.onZoom({
            bounds: {xMin, xMax, yMin, yMax}
          });
        }
      };
    }
  }

  draw() {
    const config = this.config;
    const canvas = this.canvas;
    const hiddenCanvas = this.hiddenCanvas;
    const overlayCanvas = this.overlayCanvas;
    const ctx = this.ctx;
    const hiddenCtx = this.hiddenCtx;
    const overlayCtx = this.overlayCtx;
    const data = this.config.data;
    const canvasWidth = this.container.clientWidth;
    const canvasHeight = this.container.clientHeight;
    const margins = (config.margins = {
      top: 40,
      right: 40,
      bottom: 60,
      left: 80,
      ...config.margins
    });
    const width = canvasWidth - margins.left - margins.right;
    const height = canvasHeight - margins.top - margins.bottom;
    const lines = this.config.lines || [];
    config.pointMap = {}; // maps colors to data indexes

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    hiddenCanvas.width = canvasWidth;
    hiddenCanvas.height = canvasHeight;

    overlayCanvas.width = canvasWidth;
    overlayCanvas.height = canvasHeight;

    const xData = data.map(d => d[config.xAxis.key]);
    const yData = data.map(d => d[config.yAxis.key]);

    if (!config.xAxis.extent) config.xAxis.extent = extent(xData);

    if (!config.yAxis.extent) config.yAxis.extent = extent(yData);

    if (!config.xAxis.ticks || config.allowZoom)
      config.xAxis.ticks = getTicks(...config.xAxis.extent, 10);

    if (!config.yAxis.ticks || config.allowZoom)
      config.yAxis.ticks = getTicks(...config.yAxis.extent, 10);

    config.xAxis.scale = getScale(config.xAxis.extent, [0, width]);
    config.yAxis.scale = getScale(config.yAxis.extent, [height, 0]);
    config.xAxis.inverseScale = getScale([0, width], config.xAxis.extent);
    config.yAxis.inverseScale = getScale([height, 0], config.yAxis.extent);

    ctx.clearRect(0, 0, width, height);
    drawPoints(config, ctx, hiddenCtx);
    axisLeft(config, ctx);
    axisBottom(config, ctx);
    for (let line of lines) {
      this.drawLine(line);
    }
  }

  drawLine(line) {
    // draw a horizontal line
    if (line.y) {
      let margins = this.config.margins;
      let y = this.config.yAxis.scale(line.y) + margins.top;
      this.ctx.beginPath();
      this.ctx.globalAlpha = 0.6;
      this.ctx.strokeStyle = '#888';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([6, 4]);
      this.ctx.moveTo(margins.left, y);
      this.ctx.lineTo(this.canvas.width - margins.right, y);
      this.ctx.stroke();
    }
  }

  isWithinMargins(x, y) {
    let margins = this.config.margins;
    return (
      x > margins.left &&
      x < this.canvas.width - margins.right &&
      y > margins.top &&
      y < this.canvas.height - margins.bottom
    );
  }

  attachEventHandlers(canvas) {
    const config = this.config;

    // change mouse cursor depending on what is being hovered over
    canvas.onmousemove = ev => {
      let { x, y } = viewportToLocalCoordinates(
        ev.clientX,
        ev.clientY,
        ev.target
      );
      let withinMargins = this.isWithinMargins(x, y);
      let cursor = 'default';

      if (
        (withinMargins && config.xAxis.allowSelection) ||
        this.getPointFromEvent(ev)
      )
        cursor = 'pointer';
      else if (withinMargins && config.allowZoom) cursor = 'crosshair';

      canvas.style.cursor = cursor;
    };

    if (config.point.onhover || config.point.tooltip) {
      canvas.addEventListener(
        'mousemove',
        debounce(async ev => {
          // this.hideTooltip();
          const { tooltip, onhover } = config.point;
          const { trigger, content } = tooltip;
          const point = this.getPointFromEvent(ev);
          if (!point) return;

          if (onhover) onhover(point);

          if (content && trigger === 'hover')
            this.showTooltip(ev, await content(point, this.tooltip));
        }, config.point.tooltipDelay || 300)
      );
    }

    // call click event callbacks
    if (config.point.onclick || config.point.tooltip)
      canvas.addEventListener('click', async ev => {
        this.hideTooltip();
        const { tooltip, onclick } = config.point;
        const { trigger, content } = tooltip;
        const point = this.getPointFromEvent(ev);
        if (!point) return;

        if (onclick) onclick(point);

        if (content && trigger === 'click')
          this.showTooltip(ev, await content(point, this.tooltip));
      });
  }

  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.classList.add('manhattan-plot-tooltip');
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    return tooltip;
  }

  showTooltip(ev, html) {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );
    this.tooltip.innerHTML = '';
    this.tooltip.style.display = 'inline-block';
    this.tooltip.style.left = x - 2 + 'px';
    this.tooltip.style.top = y - 2 + 'px';
    if (html instanceof Element)
      this.tooltip.insertAdjacentElement('beforeend', html);
    else this.tooltip.insertAdjacentHTML('beforeend', html);
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  getPointFromEvent({ clientX, clientY, target }) {
    let ctx = this.hiddenCtx;
    if (!ctx) return null;
    let { x, y } = viewportToLocalCoordinates(clientX, clientY, target);
    const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
    return a ? this.config.pointMap[rgbToColor(r, g, b)] : null;
  }

  /** remove references to objects for garbage collection */
  destroy() {
    this.canvas.remove();
    this.overlayCanvas.remove();
    this.tooltip.remove();

    this.canvas.onclick = null;
    this.hiddenCanvas = null;
    this.overlayCanvas = null;
    this.tooltip = null;

    this.ctx = null;
    this.hiddenCtx = null;
    this.overlayCtx = null;

    this.config = null;
  }
}
