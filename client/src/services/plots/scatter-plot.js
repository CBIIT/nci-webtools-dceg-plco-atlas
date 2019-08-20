import { scaleLinear } from 'd3';

const defaultConfig = {
  canvas: {
    el: undefined,
    height: 600,
    width: 700
  },
  margins: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
  },
  point: {
    fast: false,
    size: 4,
    opacity: 0.5,
    color: '#000',
    altColor: '#888',
    dataKey: undefined
  }
};

export function scatterPlot(config) {
  // initialize configuration
  config = Object.assign({}, defaultConfig, config);
  const margins = config.margins;
  const canvasWidth = config.canvas.width;
  const canvasHeight = config.canvas.height;
  const width = canvasWidth - margins.left - margins.right;
  const height = canvasHeight - margins.top - margins.bottom;

  /** @type HTMLCanvasElement */
  const canvas = config.canvas.el || document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // get the canvas rendering context and translate it by the left/top margin
  const context = canvas.getContext('2d');
  context.translate(margins.left, margins.top);

  // scale x by the inner width
  const scaleX = scaleLinear()
    .domain([config.x.min, config.x.max])
    .range([0, width])
    .nice();

  // scale y by the inner height, reversed
  const scaleY = scaleLinear()
    .domain([config.y.min, config.y.max])
    .range([height, 0])
    .nice();

  // initialize styles for drawing each point
  let { data, point } = config;
  let { color, fast, opacity, size } = point;
  const drawPoint = fast
    ? // fillRect is much faster than filling arcs, but looks good only for
      // smaller point sizes
      (context, x, y, size) => {
        context.fillRect(x, y, size, size);
      }
    : (context, x, y, size) => {
        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, true);
        context.fill();
      };

  // set opacity for the following points
  const initialOpacity = context.globalAlpha;
  context.globalAlpha = opacity;
  for (let i = 0; i < data.length; i++) {
    // color is a string or a function which returns a string
    context.fillStyle = color instanceof Function ? color(data[i], i) : color;
    context.strokeStyle = context.fillStyle;
    let cx = scaleX(data[i][config.x.key]);
    let cy = scaleY(data[i][config.y.key]);
    drawPoint(context, cx, cy, size);
  }

  // reset opacity and transformations
  context.globalAlpha = initialOpacity;
  context.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}
