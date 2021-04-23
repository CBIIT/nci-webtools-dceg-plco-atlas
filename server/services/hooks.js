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
            done();
        }
    }
}

function useSetRedisKey(options) {
    return function(req, reply, done) {

    }
}

function useGetRedisKey(options) {
    return function(req, reply, done) {

    }
}

module.exports = {
    useResponseLogger,
    useBrowserOnly,
    useSetRedisKey,
    useGetRedisKey,
};