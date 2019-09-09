const defaultTextDef = {
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  fillStyle: 'black'
};

export const systemFont = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
  'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

export function renderText(ctx, textDefs, defaultDef) {
  ctx.save();
  defaultDef = Object.assign({}, defaultTextDef, defaultDef);

  let lastOffset = 0;
  if (typeof textDefs === 'string')
    textDefs = [{text: textDefs}];

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
  if (typeof textDefs === 'string')
    textDefs = [{text: textDefs}];

  textDefs.forEach(function(def) {
    if (typeof def === 'string') def = { text: def };
    for (let key in defaultDef) ctx[key] = def[key] || defaultDef[key];
    lastOffset += ctx.measureText(def.text).width;
  });
  return lastOffset;
}
