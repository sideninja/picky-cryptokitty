const rest = require('./rest/controllers');
const setup = require('../flow/migrations/setup');
const flow = require('./rest/controllers/flow');
const flowService = require('../flow/lib/service');

(async () => {
  // deploy all contracts
  await setup.init();

  // start rest apis
  await rest.start();

  // start runner to update kitten
  setInterval(() => runner(), 15*1000);
})();



/**
 * Due to a bug in cadence for timestamp we need to call this periodically
 */

async function runner() {
  console.log('running runner for kitten update');

  flow.kittens.forEach(async kitten => {
    try {
      await flowService.updateKitten(kitten);
    }
    catch (err) {
      flow.kittens.splice(flow.kittens.indexOf(kitten), 1);
    }
  });
}
