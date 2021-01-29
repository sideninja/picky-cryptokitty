const fs = require('fs');
const path = require('path');
const config = require("config");
const Network = require('../lib/network');
const Account = require('../lib/account');

let contractsAddresses = {};

function loadContract(file) {
  return fs.readFileSync(
    path.join(__dirname, `${config.get('locations.contracts')}${file}.cdc`), "utf8"
  )
}

function loadTransaction(file) {
  return fs.readFileSync(
    path.join(__dirname, `${config.get('locations.transactions')}${file}.cdc`), "utf8"
  )
}

function loadScript(file) {
  return fs.readFileSync(
    path.join(__dirname, `${config.get('locations.scripts')}${file}.cdc`), "utf8"
  )
}

function addContractAddress(name, address) {
  contractsAddresses[name] = address;
}

function getContractAddress(name) {
  return contractsAddresses[name];
}

function insertAddresses(code) {
  Object.keys(contractsAddresses)
    .forEach(name => {
      code = code.replace(
        new RegExp(`0x${name}`, "gi"), getContractAddress(name)
      )
    });

  return code;
}

/**
 * Get main account optionally with address
 * @param {Object} address - pass address if you want specific 
 * account else new address will be created at generation 
 * @Param {Object} network - network
 */
function getAccount({ address, network }) {
  return new Account({ 
    privateKey: config.get("accounts.main.privateKey"), 
    publicKey: config.get("accounts.main.publicKey"), 
    keyIndex: 0, 
    network,
    address
  });
}

/**
 * Get account where the contract was deployed
 * @param {string} name name of the contract
 * @param {network} network network
 */
function getAccountWithContract(name, network) {
  let address = getContractAddress(name)
  return getAccount({ address, network })
}

/**
 * Get transaction file content and insert addresses
 * @param {string} name of the transaction file
 */
function getTransaction(name) {
  return insertAddresses(loadTransaction(name));
}

/**
 * Get script file content and insert addresses
 * @param {string} name of the script file 
 */
function getScript(name) {
  return insertAddresses(loadScript(name));
} 

/**
 * Get contract file and insert addresses
 * @param {string} name of the contract file
 */
function getContract(name) {
  return insertAddresses(loadContract(name));
}

/**
 * Deploy contracts to address
 * @param {string} name of the contract
 * @param {string} file file name of the contract
 * @param {account} auth authorizations and payer accounts
 * @param {network} network for the deploy
 */
async function createAccountAndDeploy(name, auth, network) {
  const account = getAccount({ network });

  // create new account address 
  await account.create({
    proposer: auth,
    payer: auth,
    authorizations: [auth]
  });
  
  // deploy contract with name
  await account.addContract(name, getContract(name));
  // add new created contract with address and name to our list
  addContractAddress(name, account.getAddress());

  console.log(`contract ${name} deployed to: ${account.getAddress()}`);
}


module.exports = { 
  getContractAddress, 
  getTransaction, 
  getScript, 
  getAccount, 
  getAccountWithContract, 
  createAccountAndDeploy 
};