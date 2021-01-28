const fs = require('fs');
const path = require('path');
const Network = require('../lib/network');
const Account = require('../lib/account');
const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const config = require("config");
const deployContracts = require('../migrations/deploy');
const helpers = require('./helpers');

const pubKey = '3b3ea4b6d02d488d47feeb07709b471be4d2dc50ffeeef143c48535ee959205fe865563fcd9ab0e144f11bd6f721bd8ca64908427e639993840cb4af651c2e20';
const privKey = '7a794858e91c74a033bc4d756c651781c16715c07830da71e7b190685d43fcaa';

function loadTx(file) {fs
  return fs.readFileSync(
    path.join(__dirname, `../../cadence/transactions/${file}.cdc`), "utf8"
  )
}

function loadScript(file) {fs
  return fs.readFileSync(
    path.join(__dirname, `../../cadence/scripts/${file}.cdc`), "utf8"
  )
}

(async() => {
  //await helpers.runEmulator();
  
  await deployContracts();

  const network = new Network({ node: config.get("flow.network") });
  const mainAccount = new Account({ 
    address: config.get("accounts.main.address"), 
    privateKey: config.get("accounts.main.privateKey"), 
    publicKey: config.get("accounts.main.publicKey"), 
    keyIndex: 0, 
    network 
  });

  const account = new Account({ 
    address: '0x120e725050340cab',
    publicKey: pubKey,
    privateKey: privKey,
    keyIndex: 0,
    network 
  });

  let result = await account.sendTransaction({
    transaction: loadTx('setup_account'),
    args: [],
    proposer: account,
    payer: mainAccount,
    authorizations: [account],
    network
  });

  console.log('setup account');
  console.log(result);

  result = await account.sendScript(
    loadScript('get_collection_ids'), 
    [fcl.arg('0x120e725050340cab', t.Address)],
    network
  );
 
  console.log('get collections');
  console.log('result', result)
  

})().catch(err => console.log(err));