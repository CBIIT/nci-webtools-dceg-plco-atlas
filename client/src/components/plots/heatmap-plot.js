import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePhenotypeCorrelations } from '../../services/actions';
import { Spinner } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import {
  viewportToLocalCoordinates,
  createElement as h
} from '../../services/plots/utils';

export function Heatmap() {
  const dispatch = useDispatch();

  const {
    heatmapData,
    heatmapLayout,
    // tooltipData,
    loading
  } = useSelector(state => state.phenotypeCorrelations);

  const createTooltip = () => {
    const tooltip = document.createElement('div');
    tooltip.classList.add('heatmap-tooltip');
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    return tooltip;
  };

  const showTooltip = (ev, tooltip, html) => {
    let { x, y } = viewportToLocalCoordinates(
      ev.clientX,
      ev.clientY,
      ev.target
    );

    tooltip.innerHTML = '';
    tooltip.style.display = 'inline-block';
    if (html instanceof Element) {
      console.log('ELEMENT');
      tooltip.insertAdjacentElement('beforeend', html);
    } else {
      console.log('HTML');
      tooltip.insertAdjacentHTML('beforeend', html);
    }

    const tooltipLeft = x + 130 + 'px';
    const tooltipTop = y + 120 + 'px';

    tooltip.style.left = tooltipLeft;
    tooltip.style.top = tooltipTop;
  };

  const hideTooltip = () => {
    // if tooltip already exists, destroy
    const elem = document.getElementsByClassName('heatmap-tooltip');
    if (elem && elem.length > 0) {
      elem[0].remove();
    }
    // tooltip.style.display = 'none';
  };

  const popupMarkerClick = e => {
    console.log('E', e);
    const ev = e.event;
    console.log('EVENT', ev);
    const points = e.points;
    console.log('POINTS', points);
    if (e && ev && points && points[0]) {
      hideTooltip();
      const tooltip = createTooltip();
      // add tooltip to heatmap container
      const heatmapContainer = document.getElementsByClassName('heatmap')[0];
      const containerStyle = getComputedStyle(heatmapContainer);
      if (containerStyle.position === 'static') {
        heatmapContainer.style.position = 'relative';
      }
      heatmapContainer.appendChild(tooltip);
      // show tooltip
      const tooltipX = points[0].text.x;
      const tooltipY = points[0].text.y;
      const tooltipCorrelation = points[0].text.z;
      const html = h('div', { className: '' }, [
        h('div', null, [
          h(
            'a',
            {
              className: '',
              href: 'javascript:void(0)',
              onclick: () => console.log(tooltipX)
            },
            `${tooltipX}`
          )
        ]),
        h('div', null, [
          h(
            'a',
            {
              className: '',
              href: 'javascript:void(0)',
              onclick: () => console.log(tooltipY)
            },
            `${tooltipY}`
          )
        ]),
        h('div', null, [h('b', null, 'Correlation: '), `${tooltipCorrelation}`])
      ]);
      showTooltip(ev, tooltip, html);
    }
  };

  const config = {
    responsive: true,
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'custom_image',
      height: 1000,
      width: 1000,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },
    displaylogo: false,
    modeBarButtonsToRemove: [
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian'
    ]
  };

  return (
    <>
      <div className="row">
        <div
          className="col-md-12"
          style={{
            display: heatmapData.length > 0 && !loading ? 'block' : 'none'
          }}>
          <div style={{ display: loading ? 'none' : 'block' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'left'
              }}>
              <Plot
                className="heatmap"
                style={{ position: 'relative', height: '1000px', width: '1000px' }}
                data={heatmapData}
                layout={heatmapLayout}
                config={config}
                onClick={e => popupMarkerClick(e)}
                onRelayout={relayout => {
                  hideTooltip();
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div
            className="text-center"
            style={{ display: loading ? 'block' : 'none' }}>
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </div>
      </div>
    </>
  );
}
