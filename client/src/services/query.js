// set api root, removing trailing slashes
export const root = (process.env.NODE_ENV === 'development'
  ? 'http://localhost:9000'
  : window.location.pathname
).replace(/\/+$/, '');

/**
 * Serializes an object as a query string
 * @param {object} obj
 */
function asQueryString(obj) {
  const query = [];
  for (let key in obj)
    query.push([key, obj[key]].map(encodeURIComponent).join('='));
  return '?' + query.join('&');
}

/**
 * allows users to query api using database name, bp positions (bpMin, bpMax) and p-values (pMin, pMax)
 * eg: http://localhost:9000/query?database=example&bpMin=0&bpMax=1000000&pMin=0&pMax=0.0001
 * @param {*} params
 */
export const query = (resource, params) =>
  fetch(`${root}/${resource}${asQueryString(params)}`).then(r => r.json());

export const rawQuery = (resource, params) =>
  fetch(`${root}/${resource}${asQueryString({ ...params, raw: true })}`).then(
    r => r.json()
  );
