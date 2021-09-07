module.exports = { request, asQueryString };

/**
 * Serializes an object as a query string
 * @param {object} obj
 */
 function asQueryString(obj) {
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


function request(url, opts) {
  return new Promise((resolve, reject) => {

      if (!(url instanceof URL)) {
          url = new URL(url);
      }

      const lib = url.protocol == 'https:' ? require('https') : require('http');

      const req = lib.request(url, { ...opts }, res => {
          res.setEncoding('utf8');

          const isSuccess = String(res.statusCode).startsWith('2');
          const isRedirect = String(res.statusCode).startsWith('3');
          
          const callback = data => {
              if (isRedirect && res.headers.location) {
                  request(res.headers.location, opts).then(resolve);
              } else if (isSuccess) {
                  resolve(data);
              } else {
                  reject(data);
              }
          }
          
          let buffer = '';

          res.on('data', data => buffer += data);
          res.on('end', _ => callback(buffer));
          res.on('error', error => reject(error));
      });

      req.on('timeout', _ => req.destroy());
      req.on('error', error => reject(error));

      if (opts && opts.body) {
          req.write(opts.body);
      }

      req.end();
  });
}