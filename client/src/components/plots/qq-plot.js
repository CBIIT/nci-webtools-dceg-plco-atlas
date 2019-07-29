import React, { useState, useRef } from 'react';
import { rawQuery as query } from '../../services/query';
import { Button, Form, FormControl } from 'react-bootstrap';
import * as d3 from 'd3';
import * as math from 'mathjs';

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
  // const [debugQuery, setDebugQuery] = useState({});
  const [debug1, setDebug1] = useState({});
  const [debug2, setDebug2] = useState({});
  const [debug3, setDebug3] = useState({});
  const [debugQQPoints, setDebugQQPoints] = useState({});

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
        {/* <pre>{JSON.stringify(debugQuery, null, 2)}</pre> */}
        <pre>{JSON.stringify(debug1, null, 2)}</pre>
        <pre>{JSON.stringify(debug2, null, 2)}</pre>
        <pre>{JSON.stringify(debug3, null, 2)}</pre>
        <pre>{JSON.stringify(debugQQPoints, null, 2)}</pre>
      </div>
    </div>
  );

  async function loadQQData() {
    setLoading(true);
    setTimestamp(0);

    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;

    // const el = plotContainer.current;

    const variant_summary = await query('summary_qq', params);
    // setDebugQuery(variant_summary.data.flat());
    
    var variant_summary_pvals = variant_summary.data.flat();
    var variant_summary_pvals_n = variant_summary_pvals.length;

    // variant_summary.data.map(( data ) => {
    //   return variant_summary_pvals.push(variant.NLOG_P2);
    // });
    setDebug1("# of variant_summary p-values (-log10 rounded): N = " + variant_summary_pvals.length);
    var ppoints_n = ppoints(variant_summary_pvals_n);
    var qq_points = variant_summary_pvals.map((observed_p, idx) => {
      return [observed_p, ppoints_n[idx]];
    });
    
    var one_minus_median_p = 1 - math.pow(10, -1.0 * math.median(variant_summary_pvals));
    setDebug2("lambdaGC = " + qchisq(0.5, 1) + " median = " + one_minus_median_p);

    setDebug3("# of QQ plot points: " + qq_points.length);
    setDebugQQPoints(qq_points);

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

  function probabilityDensity(x, v) {
    // console.log(math.pow(x, (v / 2.0) - 1.0));
    // console.log(math.pow(math.e, (x / 2.0) * -1.0));
    var numer = (math.pow(x, (v / 2.0) - 1.0) * (math.pow(math.e, (x / 2.0) * -1.0)))
    var denom = (math.pow(2.0, (v / 2.0)) * (math.gamma(v / 2.0)));
    var probabilityDensity = numer / denom;
    return probabilityDensity;
  }

  function qchisq(p, df) {
    return probabilityDensity(p, df);
  }

}


// round(
  
//   qchisq(1 - median(pvector), 1) /
//    qchisq(0.5, 1)

// , 4)

