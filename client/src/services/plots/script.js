import { ManhattanPlot } from './manhattan-plot.js';
import { systemFont } from './text.js';

(async function main() {
  let response = await fetch('variants.json').then(e => e.json());
  let ranges = await fetch('ranges.json').then(e => e.json());
  ranges = ranges.filter(e => e.chr <= 22); // filter out chromosomes 23+ for now

  let data = response.data;
  let columnIndexes = {
    chr: response.columns.indexOf('chr'),
    bp: response.columns.indexOf('bp'),
    nLogP: response.columns.indexOf('nlog_p')
  };
  let withKeys = data => ({
    chr: data[columnIndexes.chr],
    bp: data[columnIndexes.bp],
    nLogP: data[columnIndexes.nlog_p]
  });

  let config = {
    data: data,
    xAxis: {
      title: [
        { text: `Ewing's Sarcoma - Chr 10`, font: `600 14px ${systemFont}` }
      ],
      key: columnIndexes.bp,
      tickFormat: tick => (tick / 1e6).toFixed(3) + ' MB'
      // ticks: ranges.map(r => r.max_bp_abs),
      // tickFormat: (tick, i) => ranges[i].chr,
      // labelsBetweenTicks: true,
      // allowSelection: true,
      // onSelected: (range, i) => {
      //   console.log('selected x axis section', range, i)
      // }
    },
    yAxis: {
      title: [
        { text: `-log`, font: `600 14px ${systemFont}` },
        { text: '10', textBaseline: 'middle', font: `600 10px ${systemFont}` },
        { text: `(p)`, font: `600 14px ${systemFont}` }
      ],
      key: columnIndexes.nLogP,
      tickFormat: tick => tick.toFixed(3)
    },
    point: {
      size: 4,
      opacity: 0.6,
      color: '#005ea2',
      // color: (d, i) => d[columnIndexes.chr] % 2 ? '#005ea2' : '#e47833',
      tooltip: {
        trigger: 'click',
        class: 'custom-tooltip',
        style: 'width: 300px;',
        content: async data => {
          let obj = withKeys(data);
          return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
        }
      },
      onClick: data => {
        console.log('clicked', data);
      }
    },
    allowZoom: true,
    onZoom: e => console.log(e)
  };

  let container = document.querySelector('#plot-container');
  let plot = new ManhattanPlot(container, config);
})();
