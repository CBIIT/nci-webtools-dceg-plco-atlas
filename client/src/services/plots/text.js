const defaultTextDef = {
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  fillStyle: 'black'
};

export const systemFont = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

/**
 * Renders text using the specified context and text definitions
 * To position text, you should translate the context before calling this function,
 * and reset afterwards
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {any[]} textDefs - An array of text definitions. Each definition
 * has the following properties: [text, font, textAlign, textBaseline, fillStyle]
 * @param {any} defaultDef - an object containing default properties for each
 * text definition
 * @example
 * ```
 * var canvas = document.querySelector('canvas');
 * var ctx = canvas.getContext('2d');
 * renderText(ctx, 20, 20, [
 *     {text: 'Sample: -log', textBaseline: 'middle'},
 *     {text: '10', textBaseline: 'top', font: '600 10px "Segoe UI"'},
 *     {text: '(p)', textBaseline: 'middle'},
 * ], {font: '600 14px "Segoe UI"'});
 * ```
 */
export function renderText(ctx, textDefs, defaultDef) {
  ctx.save();

  defaultDef = Object.assign({}, defaultTextDef, defaultDef);

  let lastOffset = 0;
  textDefs.forEach(function(def) {
    if (typeof def === 'string') def = { text: def };
    for (let key in defaultDef) ctx[key] = def[key] || defaultDef[key];
    ctx.fillText(def.text, lastOffset, 0);
    lastOffset += ctx.measureText(def.text).width;
  });

  ctx.restore();
}

export function measureWidth(ctx, textDefs, defaultDef) {
  let lastOffset = 0;
  textDefs.forEach(function(def) {
    if (typeof def === 'string') def = { text: def };
    for (let key in defaultDef) ctx[key] = def[key] || defaultDef[key];
    lastOffset += ctx.measureText(def.text).width;
  });
  return lastOffset;
}
