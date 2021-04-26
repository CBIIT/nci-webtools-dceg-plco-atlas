const { UAParser } = require('ua-parser-js');

// log response status code, time, path, and query params
function useResponseLogger(request, reply, done) {
  request.log.info(
    [
      `[${reply.statusCode}]`,
      `[${Math.round(reply.getResponseTime())} ms]`,
      request.routerPath,
      JSON.stringify(request.query),
    ].join(" ")
  );
  done();
}

function useBrowserOnly(options) {
    return function(request, reply, done) {
        const browser = new UAParser(request.headers['user-agent']).getBrowser();
        if (!browser.name) {
            reply.send(options.message);
        }
        done();
    }
}

// intended to be called from preSerialization
function useSetRedisKey({match}) {
    return function(request, reply, payload, done) {
        if (match(request, reply, payload, done)) {
            request.log.info(`setRedisKey match`, request.url, payload);

        }
        done();
    }
}

// intended to be called from onResponse
function useGetRedisKey({match}) {
    return function(request, reply, done) {
        if (match(request, reply, done)) {
            request.log.info(`getRedisKey match`, request.url);

        }
        done();
    }
}

module.exports = {
    useResponseLogger,
    useBrowserOnly,
    useSetRedisKey,
    useGetRedisKey,
};