const Account = require('../flow/lib/account');
const Network = require('../flow/lib/network');
const t = require('@onflow/types');
const fcl = require('@onflow/fcl');
const Api = require('./api');

const network = new Network({ node: "http://localhost:8080" });

// todo this would have to be done via authorization and wallet discovery but due to a bug this is a workaround
let mainAccount = new Account({
  address: "f8d6e0586b0a20c7",
  privateKey: "bf9db4706c2fdb9011ee7e170ccac492f05427b96ab41d8bf2d8c58443704b76",
  publicKey: "c8e020c9ddd636cdf82084958914610af86099c3e69c58b53994fdfe537673a261c71b2bcabdf2e5ed7d6bb4113dfe9762ce77adc4108e538d8488d1d4c90b1e",
  keyIndex: 0,
  network
});

/**
 * Create an account for user and initialize it with all the resources needed for this game
 * @param {flow} flow 
 */
async function createAndSetupAccount(flow) {
  
  let balance = await mainAccount.getBalance();
  console.log(balance);

  let userAccount = await mainAccount
    .create({ 
      proposer: mainAccount, 
      payer: mainAccount, 
      authorizations: [mainAccount] 
    });

  console.log(userAccount.getAddress());
  
  let result = await userAccount.sendTransaction({
    transaction: flow.setup_account_hairball,
    args: [],
    proposer: userAccount,
    payer: userAccount,
    authorizations: [userAccount]
  });

  console.log('account setup ft', result);

  result = await userAccount.sendTransaction({
    transaction: flow.setup_account_kitty,
    args: [],
    proposer: userAccount,
    payer: userAccount,
    authorizations: [userAccount]
  });

  return userAccount;
}

/**
 * Fetch account token balance
 * @param {*} flow 
 * @param {*} userAccount 
 */
async function updateBalance(flow, userAccount) {
  // fetch hairball balance
  let balance = await userAccount.sendScript({
    script: flow.get_hairball_balance,
    args: [ fcl.arg(userAccount.getAddress(), t.Address) ]
  });
  console.log('hairball balance', balance);
  
  updateBalanceUI(balance);
}


/** --------------------------------------------------------
 * Main Section
 ----------------------------------------------------------- */

(async function() {

  // get all deployed interactions
  let flow = await Api.getFlowAll();
  console.log('available interactions', flow);

  // create a new account and setup
  let userAccount = await createAndSetupAccount(flow);
  console.log(`account setup complete, address: ${userAccount.getAddress()}`);

  updateAddressUI(userAccount.getAddress());

  // create a kitten for us and fetch it
  await Api.getKitten(userAccount.getAddress());
  // fetch kitten from account
  let kitten = await userAccount.sendScript({
    script: flow.get_kitten,
    args: [ 
      fcl.arg(userAccount.getAddress(), t.Address), 
      fcl.arg(1, t.UInt64)
    ]
  });
  console.log('our kitten', kitten);
  await updateBalance(flow, userAccount);
  
  setupInteractions(flow, userAccount);
  
})();


/** --------------------------------------------------------
 * GUI Section
 ----------------------------------------------------------- */

function setupInteractions(flow, userAccount) {

  $("#get-tokens").click(async () => {
    await Api.getTokens(userAccount.getAddress());
    await updateBalance(flow, userAccount);
  });

}

function updateAddressUI(address) {
  $("#address").html(address);
}

function updateBalanceUI(balance) {
  $("#balance").html(balance);
}

function updateEnergy() {

}