// set api root, removing trailing slashes
export const root = window.location.pathname.replace(/\/+$/, '');

/**
 * Serializes an object as a query string
 * @param {object} obj
 */
export function asQueryString(obj) {
  const query = [];
  for (let key in obj) {
    let value = obj[key];

    // treat arrays as comma-delineated lists
    if (Array.isArray(value)) value = value.join(',');

    // exclude undefined, null, or false values
    if (![undefined, null, false].includes(value))
      query.push([key, value].map(encodeURIComponent).join('='));
  }
  return '?' + query.join('&');
}

/**
 * allows users to query api using phenotype id, sex, chromosome, and p-value/position ranges
 * eg: http://localhost:9000/query?database=example&bpMin=0&bpMax=1000000&pMin=0&pMax=0.0001
 * @param {*} params
 */
export const query = (resource, params) =>
  fetch(`${root}/${resource}${asQueryString(params)}`).then(r => r.json());

export const rawQuery = (resource, params) =>
  query(resource, { ...params, raw: true });

export const post = (resource, params) =>
  fetch(`${root}/${resource}`, {
    method: 'post',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params)
  }).then(r => r.json());
