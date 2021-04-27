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
function useSetRedisKey({match, redis}) {
    return function(request, reply, payload, done) {

        if (match(request, reply, payload)) {
            request.log.info(`setRedisKey match: ${request.url}`);
            redis.set(request.url, JSON.stringify(payload), error => {
                // asynchronously set value
                if (error) {
                    request.log.error(`Could not cache: ${request.url}`);
                    request.log.error(error);
                }
            }); 
        }
        done();
    }
}

// intended to be called from onResponse
function useGetRedisKey({match, redis}) {
    return function(request, reply, done) {

        if (match(request, reply)) {
            request.log.debug(`Got value from cache: ${request.url}`);
            redis.get(request.url, (error, value) => {
                if (!error && value)
                    reply.send(value);
                done();
            });

        } else {
            done();
        }
    }
}

module.exports = {
    useResponseLogger,
    useBrowserOnly,
    useSetRedisKey,
    useGetRedisKey,
};