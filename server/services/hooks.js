// log response status code, time, path, and query params
function logResponse(req, reply, done) {
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

module.exports = {
    useBrowserOnly,
    logResponse,
};