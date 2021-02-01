const config = require('config');
const restify = require('restify');
const tokens = require('./tokens');
const flow = require('./flow');

var server = restify.createServer();

function addHandler(method, url, handler) {
  server[method](url, async (req, res, next) => {
    try {
      let result = await handler(req);
      res.send(result);
    }
    catch (err) {
      console.log('error', err);
      next(err);
    }
  });
}

addHandler('post', '/tokens', req => tokens.receive(req.body.foo));

addHandler(
  'get', 
  '/flow/:type/:name', 
  req => flow.get(req.params.type, req.params.name)
);

addHandler(
  'get',
  '/flow',
  req => flow.getAll()
)


async function start() {
  console.log('starting server');

  server.listen(config.get("api.rest.port"), function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}


module.exports = { start }