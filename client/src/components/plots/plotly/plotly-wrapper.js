import React from 'react';
import Plot from 'react-plotly.js';
import './plotly-wrapper.scss'

export const PlotlyWrapper = params => {
    return (
        <Plot
            className={params.className}
            style={params.style}
            data={params.data}
            layout={params.layout}
            config={params.config}
            onClick={params.onClick}
            onRelayout={params.onRelayout}
            onLegendClick={params.onLegendClick}
        />
    );
}