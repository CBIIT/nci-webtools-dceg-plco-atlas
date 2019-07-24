import React, { useState, useRef } from 'react';
import { query } from '../../services/query';
import { Button, Form, FormControl } from 'react-bootstrap';
import * as d3 from 'd3';

export function QQPlot(props) {
  const plotContainer = useRef(null);
  const [timestamp, setTimestamp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    database: 'example',
    chr: 10,
    nlogpMin: 3,
    nlogpMax: 20,
    bpMin: 0,
    bpMax: 10e7
  });
  const [debug1, setDebug1] = useState({});
  const [debug2, setDebug2] = useState({});
  const [debug3, setDebug3] = useState({});

  return (
    <div className="row">
      <div className="col-md-12">
        <Button
          variant="primary"
          className="my-2"
          onClick={e => loadQQData()}
          disabled={loading}>
          Show Data
        </Button>
        {timestamp ? <strong className="ml-2">{timestamp} s</strong> : null}
      </div>

      <div className="col-md-12">
        {/* <div ref={plotContainer} /> */}
        <pre>{JSON.stringify(debug1, null, 2)}</pre>
        <pre>{JSON.stringify(debug2, null, 2)}</pre>
        <pre>{JSON.stringify(debug3, null, 2)}</pre>
      </div>
    </div>
  );

  async function loadQQData() {
    setLoading(true);
    setTimestamp(0);

    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;

    // const el = plotContainer.current;
    // const variant_range = await query('ranges', params);
    const variant_summary = await query('summary', params);

    // console.log("data", data);
    // console.log("ranges", ranges);
    var variant_summary_n = variant_summary.length;
    var variant_summary_pvals = [];
    variant_summary.map(variant => {
      return variant_summary_pvals.push(variant.NLOG_P2);
    });
    setDebug1(
      '# of variant_summary p-values (-log10 rounded): ' +
        variant_summary_pvals.length
    );
    var ppoints_n = ppoints(variant_summary_n);
    setDebug2(
      '# of ppoints generated from variant_summary length: ' + ppoints_n.length
    );
    var qq_points = variant_summary_pvals.map((observed_p, idx) => {
      return [observed_p, ppoints_n[idx]];
    });
    setDebug3(qq_points);

    setLoading(false);
    setTimestamp(getTimestamp());
  }

  function ppoints(n, a) {
    if (!a) {
      a = n <= 10 ? 3 / 8 : 1 / 2;
    }
    var points = new Array(n);
    for (var i = 1; i <= n; i++) {
      var point = (i - a) / (n + (1 - a) - a);
      points[i - 1] = point;
    }
    return points;
  }
}
