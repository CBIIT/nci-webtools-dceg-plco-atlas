// set api root
let root = (process.env.NODE_ENV === 'development'
  ? 'http://localhost:9000'
  : window.location.pathname
).replace(/\/$/, '');

/**
 * Converts an object with key-value pairs into a query string
 * Any values that are arrays will be converted to strings
 * @param {object} obj
 */
export const asQueryString = obj => {
  const query = [];
  for (let key in obj) {
    let value = obj[key];
    if (Array.isArray(value))
      value = value.join();
    const pair = [key, value].map(encodeURIComponent);
    query.push(pair.join('='));
  }
  return '?' + query.join('&');
}

/**
 * allows users to query api using database name, bp positions (bpMin, bpMax) and p-values (pMin, pMax)
 * eg: http://localhost:9000/query?database=example&bpMin=0&bpMax=1000000&pMin=0&pMax=0.0001
 * @param {*} params
 */
export const query = (resource, params) =>
  fetch(`${root}/${resource}/${asQueryString(params)}`).then(r => r.json());
