import {
  debounce,
  extent,
  getCanvasAndContext,
  packRanges,
  rgbToColor,
  setStyles,
  viewportToLocalCoordinates,
  ensureNonStaticPositioning
} from './utils.js';
import { measureWidth, renderText, systemFont } from './text.js';
import { getScale, getTicks } from './scale.js';
import { axisLeft, axisBottom } from './axis.js';
import { drawPoints } from './points.js';
import { drawSelectionOverlay, drawZoomOverlay } from './overlays.js';
import { createTooltip, showTooltip, hideTooltip } from './tooltip.js';

export class ManhattanPlot {
  defaultConfig = {
    manhattanPlotHeight: 600,
    margins: {
      top: 30,
      right: 60,
      bottom: 40,
      left: 80
    }
  };

  constructor(container, config) {
    this.container = container;
    this.config = config;

    // ensure the plot container is not positioned statically
    ensureNonStaticPositioning(this.container);

    // create a canvas to be used for drawing main plot elements
    [this.canvas, this.ctx] = getCanvasAndContext();
    setStyles(this.canvas, { display: 'block' });
    this.container.appendChild(this.canvas);

    // create an overlay canvas to be used for selecting areas (zooming)
    [this.overlayCanvas, this.overlayCtx] = getCanvasAndContext();
    this.container.appendChild(this.overlayCanvas);
    // ensure the overlay canvas is positioned above the canvas, and is not interactive
    setStyles(this.overlayCanvas, {
      position: 'absolute',
      pointerEvents: 'none',
      top: '0',
      left: '0'
    });

    // create a hidden canvas to be used for selecting points
    [this.hiddenCanvas, this.hiddenCtx] = getCanvasAndContext();

    // create a canvas for drawing the gene plot
    this.geneCanvasContainer = document.createElement('div');
    this.geneCanvasContainer.setAttribute('data-type', 'gene-plot');
    setStyles(this.geneCanvasContainer, {
      maxHeight: '200px',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
      border: '1px solid #eee'
    });

    [this.geneCanvas, this.geneCtx] = getCanvasAndContext();
    // setStyles(this.geneCanvas, { display: 'block' });
    this.geneCanvas.height = 0;
    this.geneCanvasContainer.appendChild(this.geneCanvas);
    this.container.append(this.geneCanvasContainer);
    this.geneCanvasContainer.append(this.geneCanvas);

    // create a tooltip container
    this.tooltip = createTooltip({
      className: 'manhattan-plot-tooltip'
    });
    this.container.appendChild(this.tooltip);

    // save default extents, if they are provided
    if (this.config.xAxis.extent)
      this.config.xAxis.defaultExtent = this.config.xAxis.extent;
    if (this.config.yAxis.extent)
      this.config.yAxis.defaultExtent = this.config.yAxis.extent;

    // draw plot and attach handlers for interactive events
    this.draw();
    this.attachEventHandlers(this.canvas);
  }

  draw() {
    let {
      config,
      canvas,
      ctx,
      hiddenCanvas,
      hiddenCtx,
      overlayCanvas,
      overlayCtx,
      container: { clientWidth: canvasWidth },
      container: { clientHeight: canvasHeight }
    } = this;
    const { data, data2, mirrored } = config;
    canvasHeight = Math.min(this.defaultConfig.manhattanPlotHeight, 600);

    // determine default top, right, bottom, and left margins
    const margins = (config.margins = {
      ...this.defaultConfig.margins,
      ...config.margins
    });

    // Determine drawable area for manhattan plot
    const width = canvasWidth - margins.left - margins.right;
    const height = canvasHeight - margins.top - margins.bottom;

    // Set sizes of each canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    hiddenCanvas.width = canvasWidth;
    hiddenCanvas.height = canvasHeight;

    overlayCanvas.width = canvasWidth;
    overlayCanvas.height = canvasHeight;

    const lines = this.config.lines || [];
    config.pointMap = {}; // maps colors to data indexes

    // copy axis configs if mirrored
    if (mirrored) {
      config.xAxis2 = { ...config.xAxis, ...config.xAxis2 };
      config.yAxis2 = { ...config.yAxis, ...config.yAxis2 };
      config.point2 = { ...config.point, ...config.point2 };
    }

    let xData, xData2, yData, yData2;

    // generate extents
    if (data) {
      xData = data.map(d => d[config.xAxis.key]);
      yData = data.map(d => d[config.yAxis.key]);

      if (!config.xAxis.extent) config.xAxis.extent = extent(xData);

      if (!config.yAxis.extent) config.yAxis.extent = extent(yData);
    }

    if (data2) {
      xData2 = data2.map(d => d[config.xAxis2.key]);
      yData2 = data2.map(d => d[config.yAxis2.key]);

      if (!config.xAxis2.extent) config.xAxis2.extent = extent(xData2);

      if (!config.yAxis2.extent) config.yAxis2.extent = extent(yData2);

      // extend extents if 2 datasets are provided
      config.xAxis.extent = [
        Math.min(config.xAxis.extent[0], config.xAxis2.extent[0]),
        Math.max(config.xAxis.extent[1], config.xAxis2.extent[1])
      ];
      config.xAxis2.extent = [...config.xAxis.extent];

      config.yAxis.extent = [
        Math.min(config.yAxis.extent[0], config.yAxis2.extent[0]),
        Math.max(config.yAxis.extent[1], config.yAxis2.extent[1])
      ];
      config.yAxis2.extent = [...config.yAxis.extent];
    }

    // generate ticks
    const numTicks = 10;
    if (data) {
      if (!config.xAxis.ticks || config.allowZoom)
        config.xAxis.ticks = getTicks(...config.xAxis.extent, numTicks);

      if (!config.yAxis.ticks || config.allowZoom)
        config.yAxis.ticks = getTicks(...config.yAxis.extent, numTicks);
    }

    if (data2) {
      if (!config.xAxis2.ticks || config.allowZoom)
        config.xAxis2.ticks = getTicks(...config.xAxis2.extent, numTicks);

      if (!config.yAxis2.ticks || config.allowZoom)
        config.yAxis2.ticks = getTicks(...config.yAxis2.extent, numTicks);
    }

    // generate scales for regular, non-mirrored plots
    if (!config.mirrored) {
      // if not mirrored, we only generate scales for the first dataset
      config.xAxis.scale = getScale(config.xAxis.extent, [0, width]);
      config.xAxis.inverseScale = getScale([0, width], config.xAxis.extent);
      config.yAxis.scale = getScale(config.yAxis.extent, [height, 0]);
      config.yAxis.inverseScale = getScale([height, 0], config.yAxis.extent);
    } else {
      // otherwise, generate scales for both sets, and map each scale to the top/bottom
      // half of the plot area

      // both scales are full-width
      config.xAxis.scale = getScale(config.xAxis.extent, [0, width]);
      config.xAxis.inverseScale = getScale([0, width], config.xAxis.extent);

      config.xAxis2.scale = getScale(config.xAxis2.extent, [0, width]);
      config.xAxis2.inverseScale = getScale([0, width], config.xAxis2.extent);

      // top half covers height -> height/2
      config.yAxis.scale = getScale(config.yAxis.extent, [height / 2, 0]);
      config.yAxis.inverseScale = getScale(
        [height / 2, 0],
        config.yAxis.extent
      );

      // bottom half covers height/2 -> 0, inverted
      config.yAxis2.scale = getScale(config.yAxis2.extent, [
        height / 2,
        height
      ]);
      config.yAxis.inverseScale = getScale(
        [height / 2, height],
        config.yAxis.extent
      );
    }

    ctx.clearRect(0, 0, width, height);
    drawPoints(config, ctx, hiddenCtx);
    axisLeft(config, ctx);
    axisBottom(config, ctx);

    if (config.mirrored) {
      lines[1] = { y: config.yAxis.extent[0] };
    }

    for (let line of lines) {
      this.drawLine(line);
    }

    if (config.title) {
      let midpoint = margins.left + width / 2;
      ctx.save();
      ctx.translate(midpoint, 10);
      renderText(ctx, config.title, {
        textAlign: 'center',
        textBaseline: 'top',
        fillStyle: 'black'
      });
      ctx.restore();
    }
    console.log(config);
  }

  clearGenes() {
    let { config, geneCanvas, geneCtx } = this;
    geneCanvas.height = 0;
  }

  drawGenes(genes) {
    let { config, geneCanvas, geneCtx } = this;
    let { margins, xAxis } = config;

    setStyles(this.geneCanvasContainer, {
      left: margins.left + 'px',
      width: this.canvas.width - margins.left - margins.right + 'px',
      overflowX: 'hidden',
      overflowY: 'auto'
    });

    let getName = gene =>
      gene.strand === '+' ? `${gene.name} →` : `← ${gene.name}`;

    let labelPadding = 5;
    let labelHeight = 10;
    let labelConfig = {
      font: `${labelHeight}px ${systemFont}`,
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: 'black'
    };

    let rowHeight = 40 + labelHeight + labelPadding;

    geneCtx.textAlign = 'center';
    geneCtx.textBaseline = 'top';

    let genePositions = genes.map(gene => {
      let name = getName(gene);
      let padding = 5; // horiz. padding between name and gene

      let geneStart = xAxis.scale(gene.tx_start);
      let geneEnd = xAxis.scale(gene.tx_end);

      let labelWidth = measureWidth(geneCtx, name);
      let geneWidth = Math.abs(geneEnd - geneStart);
      let width = Math.max(labelWidth, geneWidth);
      let pxCenter = geneStart + geneWidth / 2;
      let pxStart = pxCenter - width / 2;
      let pxEnd = pxCenter + width / 2;

      /*
      let width = labelWidth + padding + range;

      let pxStart = geneStart - padding - labelWidth;
      let pxEnd = geneEnd + padding * 4;
      */

      return {
        ...gene,
        name,
        width,
        pxCenter,
        pxStart,
        pxEnd
      };
    });

    let geneRanges = genePositions.map(gene => {
      let horizPadding = 50;
      return [gene.pxStart - horizPadding, gene.pxEnd + horizPadding];
    });

    let packedGeneRanges = packRanges(geneRanges);

    let numRows = packedGeneRanges.length;
    let txColor = '#ddd';
    let exonColor = '#049372';
    let genePlotWidth = geneCanvas.clientWidth;

    geneCanvas.height = rowHeight * numRows;
    geneCanvas.width = this.canvas.width;
    // this.container.style.height = (geneCanvas.height + this.canvas.height) + 'px';

    packedGeneRanges.forEach((geneRow, rowIndex) => {
      let yOffset = rowHeight * rowIndex;
      let xOffset = margins.left;

      geneCtx.save();
      geneCtx.translate(0, yOffset);

      for (let geneRange of geneRow) {
        let geneIndex = geneRanges.indexOf(geneRange);
        let gene = genePositions[geneIndex];
        let geneLabel = genePositions[geneIndex];

        let start = Math.floor(xAxis.scale(gene.tx_start));
        let end = Math.ceil(xAxis.scale(gene.tx_end));

        // let start = Math.max(xAxis.scale(gene.tx_start), xOffset);
        // let end = Math.min(xAxis.scale(gene.tx_end), genePlotWidth - margins.right);

        geneCtx.save();
        geneCtx.translate(geneLabel.pxCenter, labelHeight);
        renderText(geneCtx, geneLabel.name, labelConfig);
        geneCtx.restore();

        let exonOffsetY = labelHeight + labelPadding;
        let width = Math.abs(end - start);
        let exons = gene.exon_starts.map((e, i) => [
          gene.exon_starts[i],
          gene.exon_ends[i]
        ]);

        //ctx.globalAlpha = 0.25;
        geneCtx.fillStyle = txColor;
        geneCtx.strokeStyle = txColor;
        geneCtx.strokeWidth = 2;
        geneCtx.beginPath();
        let lineY = 14.5;
        geneCtx.moveTo(start, lineY + exonOffsetY);
        geneCtx.lineTo(start + width, lineY + exonOffsetY);
        geneCtx.stroke();

        // ctx.fillRect(start, 14.5, width, 1);

        exons.forEach(exon => {
          geneCtx.fillStyle = exonColor;
          geneCtx.strokeStyle = exonColor;
          let start = config.xAxis.scale(exon[0]);
          let end = config.xAxis.scale(exon[1]);
          let width = Math.ceil(Math.abs(end - start));
          geneCtx.fillRect(start, exonOffsetY, width, 30);
        });
      }

      geneCtx.restore();
    });

    /*
    geneCtx.strokeStyle = '#ccc';
    geneCtx.clearRect(0, 0, margins.left, geneCanvas.height);
    geneCtx.clearRect(geneCanvas.width - margins.right, 0, margins.right, geneCanvas.height);
    geneCtx.strokeRect(
      margins.left,
      0,
      geneCanvas.width - margins.right - margins.left,
      geneCanvas.height,
    )
    */
  }

  drawLine(line) {
    const draw = (x1, y1, x2, y2, style) => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.globalAlpha = 0.6;
      this.ctx.strokeStyle = '#444';
      this.ctx.lineWidth = 0.5;

      if (style === 'dashed') this.ctx.setLineDash([6, 4]);

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      this.ctx.restore();
    };

    // draw a horizontal line
    if (line.y) {
      let margins = this.config.margins;
      let y = this.config.yAxis.scale(line.y) + margins.top;
      if (y > this.canvas.height - margins.bottom || y < margins.top) return;

      draw(margins.left, y, this.canvas.width - margins.right, y, line.style);

      if (this.config.mirrored) {
        let y2 = this.config.yAxis2.scale(line.y) + margins.top;
        if (y2 > this.canvas.height - margins.bottom || y2 < margins.top)
          return;
        draw(
          margins.left,
          y2,
          this.canvas.width - margins.right,
          y2,
          line.style
        );
      }
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
        (this.getPointFromEvent(ev) &&
          config.tooltip &&
          config.tooltip.trigger === 'click')
      ) {
        cursor = 'pointer';
      } else if (withinMargins && config.allowZoom) cursor = 'crosshair';

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

          if (content && trigger === 'hover' && !config.zoomOverlayActive)
            showTooltip(this.tooltip, ev, await content(point, this.tooltip));
        }, config.point.tooltipDelay || 100)
      );
    }

    // call click event callbacks
    if (config.point.onclick || config.point.tooltip)
      canvas.addEventListener('click', async ev => {
        hideTooltip(this.tooltip);
        const { tooltip, onclick } = config.point;
        const { trigger, content } = tooltip;
        const point = this.getPointFromEvent(ev);
        if (!point) return;

        if (onclick) onclick(point);

        if (content && trigger === 'click')
          showTooltip(this.tooltip, ev, await content(point, this.tooltip));
      });

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
        if (config.mirrored) {
          config.xAxis2.extent = [xMin, xMax];
          config.yAxis2.extent = [yMin, yMax];
        }
        this.draw();
        if (config.onZoom) config.onZoom(config.zoomWindow);
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
            bounds: { xMin, xMax, yMin, yMax }
          });
        }
      };
    }
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
    this.geneCanvasContainer.remove();
    this.geneCanvas.remove();

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
