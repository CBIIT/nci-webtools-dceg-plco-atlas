module.exports = { request };

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