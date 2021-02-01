const deployer = require('./deployer');
const config = require('config');
const Network = require('../lib/network');

async function init() {

  const network = new Network({ node: config.get("flow.network") });

  // main account from flow emulator
  const mainAccount = deployer.getAccount({
    address: config.get("accounts.main.address"),
    network
  });

  await deployer.createAccountAndDeploy(
    'FungibleToken',
    mainAccount,
    network
  );

  await deployer.createAccountAndDeploy(
    'NonFungibleToken', 
    mainAccount, 
    network
  );

  await deployer.createAccountAndDeploy(
    'Kitty', 
    mainAccount, 
    network
  );
  
  await deployer.createAccountAndDeploy(
    'Tuna', 
    mainAccount, 
    network
  );


}


module.exports = { init };