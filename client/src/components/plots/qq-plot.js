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
    nlogpMin: 2,
    nlogpMax: 20,
    bpMin: 0,
    bpMax: 10e7
  });
  const [debug, setDebug] = useState({});

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
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>
    </div>
  );

  async function loadQQData() {
    setLoading(true);
    setTimestamp(0);

    let start = new Date();
    let getTimestamp = e => (new Date() - start) / 1000;

    // const el = plotContainer.current;

    const data = await query('summary', params);
    const ranges = await query('ranges', params);

    // console.log("data", data);
    // console.log("ranges", ranges);
    setDebug(ranges);

    setLoading(false);
    setTimestamp(getTimestamp());
  }
}
