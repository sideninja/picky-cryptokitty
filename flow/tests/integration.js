const Network = require('../lib/network');
const Account = require('../lib/account');
const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const config = require("config");
const deployer = require('../migrations/deployer');


(async () => {

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
    'HairBall', 
    mainAccount, 
    network
  );

  // user Joe account
  let accountJoe = deployer.getAccount({ network });

  accountJoe = await accountJoe.create({
    proposer: mainAccount,
    payer: mainAccount,
    authorizations: [mainAccount]
  });

  console.log('account joe created', accountJoe.getAddress());

  let result = await accountJoe.sendTransaction({
    transaction: deployer.getTransaction('setup_account_kitty'),
    args: [],
    proposer: accountJoe,
    payer: mainAccount,
    authorizations: [accountJoe]
  });

  console.log('account joe kitty setup');
  console.log(result);

  result = await accountJoe.sendTransaction({
    transaction: deployer.getTransaction('setup_account_hairball'),
    args: [],
    proposer: accountJoe,
    payer: mainAccount,
    authorizations: [accountJoe]
  });

  console.log('account joe hairball setup');
  console.log(result);

  result = await accountJoe.sendScript({
    script: deployer.getScript('get_collection_ids'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)]
  });

  console.log('account joe collections');
  console.log(result);

  const kittyAccount = deployer.getAccountWithContract('Kitty', network);
  result = await kittyAccount.sendTransaction({
    transaction: deployer.getTransaction('mint_kittens'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)],
    proposer: kittyAccount,
    payer: kittyAccount,
    authorizations: [kittyAccount]
  });

  console.log('kitty minting');
  console.log(result);

  result = await accountJoe.sendScript({
    script: deployer.getScript('get_collection_ids'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)]
  });

  console.log('account joe collections');
  console.log(result);

  result = await mainAccount.sendTransaction({
    transaction: deployer.getTransaction('check_kitten'),
    args: [
      fcl.arg(accountJoe.getAddress(), t.Address),
      fcl.arg(1, t.UInt64)
    ],
    proposer: mainAccount,
    authorizations: [mainAccount],
    payer: mainAccount
  });

  console.log('check kitty');
  console.log(result);

  const hairballAccount = deployer.getAccountWithContract('HairBall', network);
  result = await hairballAccount.sendTransaction({
    transaction: deployer.getTransaction('mint_hairballs'),
    args: [
      fcl.arg(accountJoe.getAddress(), t.Address),
      fcl.arg("100.0", t.UFix64)
    ],
    proposer: hairballAccount,
    authorizations: [hairballAccount],
    payer: mainAccount
  });

  console.log('mint hairballs');
  console.log(result);

  result = await mainAccount.sendScript({
    script: deployer.getScript('get_hairball_balance'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)]
  });

  console.log('hairball balance');
  console.log(result);

  result = await mainAccount.sendTransaction({
    transaction: deployer.getTransaction('check_kitten'),
    args: [
      fcl.arg(accountJoe.getAddress(), t.Address),
      fcl.arg(1, t.UInt64)
    ],
    proposer: mainAccount,
    authorizations: [mainAccount],
    payer: mainAccount
  });

  console.log('check kitty again');
  console.log(result);

  result = await accountJoe.sendTransaction({
    transaction: deployer.getTransaction('feed_kitten'),
    args: [
      fcl.arg(1, t.UInt64),
      fcl.arg("5.0", t.UFix64)
    ],
    proposer: accountJoe,
    authorizations: [accountJoe],
    payer: accountJoe
  });

  console.log("hairball feeded");
  console.log(result);
  
  result = await mainAccount.sendTransaction({
    transaction: deployer.getTransaction('check_kitten'),
    args: [
      fcl.arg(accountJoe.getAddress(), t.Address),
      fcl.arg(1, t.UInt64)
    ],
    proposer: mainAccount,
    authorizations: [mainAccount],
    payer: mainAccount
  });

  console.log('check kitty again');
  console.log(result);

  result = await mainAccount.sendScript({
    script: deployer.getScript('get_hairball_balance'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)]
  });

  console.log('new hairball balance');
  console.log(result);





})().catch(err => console.log(err));