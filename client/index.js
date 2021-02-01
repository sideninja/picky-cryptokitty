const fcl = require("@onflow/fcl");
const Account = require('../flow/lib/account');
const Network = require('../flow/lib/network');

const network = new Network({ node: "http://localhost:8080" });


(async function() {

  let mainAccount = new Account({
    address: "f8d6e0586b0a20c7",
    privateKey: "bf9db4706c2fdb9011ee7e170ccac492f05427b96ab41d8bf2d8c58443704b76",
    publicKey: "c8e020c9ddd636cdf82084958914610af86099c3e69c58b53994fdfe537673a261c71b2bcabdf2e5ed7d6bb4113dfe9762ce77adc4108e538d8488d1d4c90b1e",
    keyIndex: 0,
    network
  })

  let balance = await mainAccount.getBalance();
  console.log(balance);


  let acc = await mainAccount
    .create({ 
      proposer: mainAccount, 
      payer: mainAccount, 
      authorizations: [mainAccount] 
    });

  console.log(acc.getAddress())


})();
 