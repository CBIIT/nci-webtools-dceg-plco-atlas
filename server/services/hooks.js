const { UAParser } = require('ua-parser-js');

// log response status code, time, path, and query params
function useResponseLogger(req, reply, done) {
  req.log.info(
    [
      `[${reply.statusCode}]`,
      `[${Math.round(reply.getResponseTime())} ms]`,
      req.routerPath,
      JSON.stringify(req.query),
    ].join(" ")
  );
  done();
}

function useBrowserOnly(options) {
    return function(req, reply, done) {
        const browser = new UAParser(req.headers['user-agent']).getBrowser();
        if (!browser.name) {
            res.send(options.message);
        }
        done();
    }
}

// intended to be called from preSerialization
function useSetRedisKey({match}) {
    return function(req, reply, payload, done) {
        if (match(req, reply, payload, done)) {

        }
        done();
    }
}

// intended to be called from onResponse
function useGetRedisKey({match}) {
    return function(req, reply, done) {
        done();
    }
}

module.exports = {
    useResponseLogger,
    useBrowserOnly,
    useSetRedisKey,
    useGetRedisKey,
};