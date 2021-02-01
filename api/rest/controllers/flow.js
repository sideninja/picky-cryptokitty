const deployer = require('../../../flow/migrations/deployer');
const flow = require('../../../flow/lib/service');

// workaround a bug
const kittens = [];

/**
 * Get a cadance file replaced with address by name and type
 * @param {*} type type of interaction - transaction / script
 * @param {*} name name of the interaction file
 */
async function getCadance(type, name) {
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

/**
 * Get all deployed files for cadance replaced with deployed addresses
 */
async function getAllCadance() {
  return {
    get_tuna_balance: deployer.getScript('get_tuna_balance'),
    get_collection_ids: deployer.getScript('get_collection_ids'),
    feed_kitten: deployer.getTransaction('feed_kitten'),
    setup_account_tuna: deployer.getTransaction('setup_account_tuna'),
    setup_account_kitty: deployer.getTransaction('setup_account_kitty'),
    get_kitten: deployer.getScript('get_kitten')
  };
}

/**
 * Mint new tokens and send them to the address
 * @param {string} address of the wallet to receive tokens
 * @param {string} amount of the tokens to receive
 */
async function mintTokens(address) {
  return flow.mintTuna(address, "10.0");
}

/**
 * Mint new kitten for address
 * @param {*} address receiver of kitten
 */
async function mintKittens(address) {
  kittens.push(address);
  return flow.mintKittens(address);
}


module.exports = { 
  getCadance, 
  getAllCadance, 
  mintTokens, 
  mintKittens,
  kittens
};