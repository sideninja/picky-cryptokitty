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
  
  let userAccount = await mainAccount
    .create({ 
      proposer: mainAccount, 
      payer: mainAccount, 
      authorizations: [mainAccount] 
    });

  console.log(`account created: ${userAccount.getAddress()}`);
  
  let result = await userAccount.sendTransaction({
    transaction: flow.setup_account_tuna,
    args: [],
    proposer: userAccount,
    payer: userAccount,
    authorizations: [userAccount]
  });

  console.log('account setup:', result);

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
 * Fetch account token balance and update Ui
 * @param {*} flow 
 * @param {*} userAccount 
 */
async function updateBalance(flow, userAccount) {
  // fetch tuna balance
  let balance = await userAccount.sendScript({
    script: flow.get_tuna_balance,
    args: [ fcl.arg(userAccount.getAddress(), t.Address) ]
  });
  console.log('tuna balance', balance);
  
  updateBalanceUI(balance);
}

/**
 * Update kitten from the flow network and update Ui
 * @param {*} flow 
 * @param {*} userAccount 
 */
async function updateKitten(flow, userAccount) {
    // fetch kitten from account
    let kitten = await userAccount.sendScript({
      script: flow.get_kitten,
      args: [ 
        fcl.arg(userAccount.getAddress(), t.Address), 
        fcl.arg(1, t.UInt64)
      ]
    });
    console.log('our kitten', kitten);

    updateKittenUI(kitten);
}

/**
 * Feed kitten and update UI
 * @param {*} flow 
 * @param {*} userAccount 
 */
async function feedKitten(flow, userAccount) {
  let feed = await userAccount.sendTransaction({
    transaction: flow.feed_kitten,
    args: [
      fcl.arg(1, t.UInt64),
      fcl.arg("5.0", t.UFix64)
    ],
    payer: userAccount,
    authorizations: [userAccount],
    proposer: userAccount
  });

  console.log('kitten fed');
  await updateKitten(flow, userAccount);
  await updateBalance(flow, userAccount);
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

  // update account balance
  await updateBalance(flow, userAccount);
  
  // create a kitten for us and fetch it
  await Api.getKitten(userAccount.getAddress());
  await updateKitten(flow, userAccount);

  // update kitten from flow and update ui
  setInterval(() => updateKitten(flow, userAccount), 5000);

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

  $("#feed-kitten").click(async () => {
    await feedKitten(flow, userAccount);
    kittenFedUI();
  });

}

function updateAddressUI(address) {
  $("#address").html(address);
}

function updateBalanceUI(balance) {
  $("#balance").html(balance);
}

function updateKittenUI(kitten) {
  $("#energy-bar i").css("width", `${kitten.energy}%`);

  if (kitten.energy <= 10) {
    $("#kitten-image").fadeOut();
    
    $(".speech-bubble").html("GAME OVER!!!!  I WILL FIND A BETTER HUMAN TO TAKE CARE OF ME !!!!");
    $(".speech-bubble").fadeIn();
  }
}

function kittenFedUI() {
  let dialogs = [
    "I'll take it but I don't have to like it.",
    "Your food is bearly enough",
    "As long as you feed me we can be friends, but don't get any ideas.",
    "Thank you for the food, tonight you can sleep",
    "I will take the food but I don't have to thank you",
    "If this is the best food you got we got problems"
  ];

  $(".speech-bubble").html(dialogs[Math.floor(Math.random() * dialogs.length-1)])

  $(".speech-bubble").fadeIn(1000);
  setTimeout(() => $(".speech-bubble").fadeOut(1000), 3000);
}