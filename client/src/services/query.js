// set api root
let root = (process.env.NODE_ENV === 'development'
    ? 'http://localhost:9000'
    : window.location.pathname
).replace(/\/$/, '');

export const asQueryString = obj => (
    Object.keys(obj).reduce(
        (acc, key) => acc.concat([key, obj[key]].map(encodeURIComponent).join('=')),
        []
    ).join('&')
);

/**
 * allows users to query api using database name, bp positions (bpMin, bpMax) and p-values (pMin, pMax)
 * eg: http://localhost:9000/query?database=example&bpMin=0&bpMax=1000000&pMin=0&pMax=0.0001
 * @param {*} params
 */
export const query = params => (
    fetch(`${root}/query?${asQueryString(params)}`)
        .then(r => r.json())
);
