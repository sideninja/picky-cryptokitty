const config = require('config');
const restify = require('restify');
const flow = require('./flow');
const setup = require('../../../flow/migrations/setup');

var server = restify.createServer();


// server configuration
server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);
server.use(restify.plugins.bodyParser({ mapParams: true }));

// handler helper for requests
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

// mint new tokens for address
addHandler(
  'post', 
  '/tokens', 
  req => flow.mintTokens(JSON.parse(req.body).address)
);

// mint kitten for address
addHandler(
  'post', 
  '/kittens', 
  req => flow.mintKittens(JSON.parse(req.body).address)
);

// get cadance interaction by name
addHandler(
  'get', 
  '/flow/:type/:name', 
  req => flow.getCadance(req.params.type, req.params.name)
);

// get all cadance interactions
addHandler(
  'get',
  '/flow',
  async req => {
    await setup.init();
    return flow.getAllCadance();
  }
)


async function start() {
  console.log('starting server');

  server.listen(config.get("api.rest.port"), function() {
    console.log('%s listening at %s', server.name, server.url);
  });
}


module.exports = { start }