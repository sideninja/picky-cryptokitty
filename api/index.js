const rest = require('./rest/controllers');
const setup = require('../flow/migrations/setup');


(async () => {
  // deploy all contracts
  await setup.init();

  await rest.start();

})();
