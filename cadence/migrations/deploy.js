const Network = require('../../lib/network');
const Account = require('../../lib/account');

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
 