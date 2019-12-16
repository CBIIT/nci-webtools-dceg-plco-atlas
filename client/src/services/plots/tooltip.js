import {
  insertAdjacentNode,
  removeChildren,
  setStyles,
  viewportToLocalCoordinates
} from './utils';

/**
 *
 * @param {object} props
 */
export function createTooltip(props) {
  const tooltip = document.createElement('div');
  for (let key in props) tooltip[key] = props[key];
  return setStyles(tooltip, {
    display: 'none',
    position: 'absolute'
  });
}

/**
 *
 * @param {Element} tooltip
 */
export function hideTooltip(tooltip) {
  setStyles(tooltip, { display: 'none' });
}

/**
 *
 * @param {Element} tooltip
 * @param {Event} ev
 * @param {Element|string} html
 */
export function showTooltip(tooltip, ev, html, options) {
  let { localX, localY } = ev;
  options = options || {};

  // get coordinates relative to event's target
  if (!localX || !localY) {
    let coords = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );

    localX = coords.x;
    localY = coords.y;
  }

  // set tooltip contents and make tooltip visible
  removeChildren(tooltip);
  insertAdjacentNode(tooltip, 'beforeend', html);
  setStyles(tooltip, { display: 'inline-block' });

  // determine where to place tooltip relative to event source
  // ensure tooltip is not drawn outside event target's boundaries
  let targetWidth = ev.target.clientWidth;
  let targetHeight = ev.target.clientHeight;
  let tooltipHeight = tooltip.clientHeight;
  let tooltipWidth = tooltip.clientWidth;
  let tooltipOffset = 5;
  let tooltipXOffset = options.center
    ? - tooltipWidth / 2
    : 0;

  let tooltipYOffset = options.above
    ? - tooltipHeight
    : 0;

  let leftOffset =
    Math.min(localX + tooltipXOffset, targetWidth - tooltipWidth) - tooltipOffset;
  let topOffset =
    Math.min(localY + tooltipYOffset, targetHeight - tooltipHeight) - tooltipOffset;

  setStyles(tooltip, {
    left: Math.max(leftOffset, 0) + 'px',
    top: topOffset + 'px'
  });
}
