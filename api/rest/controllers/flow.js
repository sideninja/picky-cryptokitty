const { transaction } = require('@onflow/sdk-build-transaction');
const deployer = require('../../../flow/migrations/deployer');

async function get(type, name) {
  if (type === 'scripts') {
    return deployer.getScript(name);
  }
  else if (type === 'transactions') {
    return deployer.getTransaction(name);
  }
  else {
    throw new Error('type not valid - only transactions and scripts are valid');
  }
}

async function getAll() {
  return {
    get_hairball_balance: deployer.getScript('get_hairball_balance'),
    get_collection_ids: deployer.getScript('get_collection_ids'),
    feed_kitten: deployer.getTransaction('feed_kitten'),
    setup_account_hairball: deployer.getTransaction('setup_account_hairball'),
    setup_account_kitty: deployer.getTransaction('setup_account_kitty')
  };
}


module.exports = { get, getAll };