const fs = require('fs');
const path = require('path');
const Account = require('./account');
const Network = require('./network');
const fcl = require("@onflow/fcl");
const t = require("@onflow/types");

const pubKey = 'c1185c32ee11a68bae4497dc9a505da630f3156dc9ab373557205f04b28ff67721f65fa5a7bcc4ec5ce8ed0add413732b167ddf8dc340a14b9279b493dbd7f3e';
const privKey = '71245135bcdc198200e3115f5c72e2e498e21ce88e8f63357038e30b435c7002';

function loadContract(name) {
  return fs.readFileSync(
    path.join(
      __dirname,
      `../cadence/contracts/${name}.cdc`
    ),"utf8");
}

/**
 * Creates new account and deploys the contract to generated address
 * @param {string} name name of the contract
 * @param {string} file filename of the file containing contract
 * @param {account} auth authorized account used to pay, propose and authorize deployment
 * @param {network} network network object containing connection to api
 */
async function createAccountAndDeploy(name, file, auth, network) {
  const account = new Account({ 
    publicKey: pubKey,
    privateKey: privKey,
    keyIndex: 0,
    network 
  });

  await account.create({
    proposer: auth,
    payer: auth,
    authorizations: [auth]
  });
  
  await account.addContract(name, loadContract(file));

  console.log(`contract ${name} deployed to: ${account.getAddress()}`);
}

(async function() {
  
  const network = new Network({ node: "http://localhost:8080" });

  const mainAccount = new Account({ 
    address: 'f8d6e0586b0a20c7', 
    privateKey: 'bf9db4706c2fdb9011ee7e170ccac492f05427b96ab41d8bf2d8c58443704b76', 
    publicKey: 'c8e020c9ddd636cdf82084958914610af86099c3e69c58b53994fdfe537673a261c71b2bcabdf2e5ed7d6bb4113dfe9762ce77adc4108e538d8488d1d4c90b1e', 
    keyIndex: 0, 
    network 
  });
  
  await createAccountAndDeploy('FungibleToken', 'FungibleToken', mainAccount, network);
  await createAccountAndDeploy('NonFungibleToken', 'NonFungibleToken', mainAccount, network);
  await createAccountAndDeploy('Kitty', 'Kitty', mainAccount, network);
  await createAccountAndDeploy('HairBall', 'HairBall', mainAccount, network);

  
})().catch(err => {
  console.log("error", err, err.stack)
}) 
 