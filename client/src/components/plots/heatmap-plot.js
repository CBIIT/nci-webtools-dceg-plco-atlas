import React, { forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { query } from '../../services/query';
import { Spinner } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import {
  viewportToLocalCoordinates,
  createElement as h
} from '../../services/plots/utils';
import { updateBrowsePhenotypes } from '../../services/actions';

export const Heatmap = forwardRef(({}, ref) => {
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => ({
    resetTooltip() {
      hideTooltip();
    }
  }));

  const {
    heatmapData,
    heatmapLayout
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
      tooltip.insertAdjacentElement('beforeend', html);
    } else {
      tooltip.insertAdjacentHTML('beforeend', html);
    }

    const tooltipLeft = x + 115 + 'px';
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

  const setBrowsePhenotypesLoading = loading =>  {
    dispatch(updateBrowsePhenotypes({ loading }));
  }

  const handlePhenotypeLookup = async (pointData) => {
    var phenotype = JSON.parse(pointData)
    
    dispatch(
      updateBrowsePhenotypes({
        phenotypeData: null,
        submitted: false,
        displayTreeParent: null
      })
    );
      
    setBrowsePhenotypesLoading(true);
    const data = await query('phenotype', {
      id: phenotype.id,
      type: 'frequency'
    });
    setBrowsePhenotypesLoading(false);

    // update browse phenotypes filters
    dispatch(
      updateBrowsePhenotypes({
        selectedPhenotype: phenotype,
        displayTreeParent: {
          data: phenotype
        },
        submitted: true,
        phenotypeData: data,
        selectedPlot: 'frequency'
      })
    );
  };

  const popupMarkerClick = e => {
    e.event.preventDefault();
    // close all plotly hover tooltips
    var plotlyHoverTooltips = document.getElementsByClassName("hovertext");
    if (plotlyHoverTooltips.length > 0) {
      plotlyHoverTooltips[0].setAttribute("style", "display: none;")
    }
    const ev = e.event;
    const points = e.points;
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
              className: 'font-weight-bold',
              href: '#/phenotypes',
              onclick: () => handlePhenotypeLookup(points[0].x)
            },
            `Go to ${tooltipX} details`
          )
        ]),
        h('div', null, [
          h(
            'a',
            {
              className: 'font-weight-bold',
              href: '#/phenotypes',
              onclick: () => handlePhenotypeLookup(points[0].y)
            },
            `Go to ${tooltipY} details`
          )
        ]),
        h('div', null, [
          h(
            'b', null, 'Correlation: '), 
            `${tooltipCorrelation}`
        ]),
        h('div', {
          className: 'tooltip-close',
          style: 'position: absolute; cursor: pointer; top: 0px; right: 5px;'
        }, [
          h(
            'i', {
              className: 'fa fa-times',
              onclick: () => hideTooltip()
            }, ``), 
            ``
        ])
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
    <div className="row">
      <div
        className="col-md-12"
        style={{
          display: heatmapData && heatmapData.length > 0 ? 'block' : 'none'
        }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'left'
          }}>
          <Plot
            className="heatmap override-cursor-heatmap"
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
      {
        heatmapData && heatmapData.length <= 0 && 
        <div className="col-md-12">
          <Spinner animation="border" variant="primary" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      }
    </div>
  );
});
