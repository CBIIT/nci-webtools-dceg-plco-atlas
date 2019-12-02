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
export function showTooltip(tooltip, ev, html) {
  // get coordinates relative to event's target
  let { x: localX, y: localY } = viewportToLocalCoordinates(
    ev.clientX,
    ev.clientY,
    ev.target
  );

  // set tooltip contents and make tooltip visible
  removeChildren(tooltip);
  insertAdjacentNode(tooltip, 'beforeend', html);
  setStyles(tooltip, { display: 'inline-block' });

  // determine where to place tooltip relative to event source
  // ensure tooltip is not drawn outside event target's boundaries
  const targetWidth = ev.target.clientWidth;
  const targetHeight = ev.target.clientHeight;
  const tooltipHeight = tooltip.clientHeight;
  const tooltipWidth = tooltip.clientWidth;
  const tooltipOffset = -2;
  const leftOffset =
    Math.min(localX, targetWidth - tooltipWidth) - tooltipOffset;
  const topOffset =
    Math.min(localY, targetHeight - tooltipHeight) - tooltipOffset;

  setStyles(tooltip, {
    left: leftOffset + 'px',
    top: topOffset + 'px'
  });
}
