const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const config = require("config");
const deployer = require('../migrations/deployer');


(async () => {

  // main account from flow emulator
  const mainAccount = deployer.getAccount({
    address: config.get("accounts.main.address")
  });

  await deployer.createAccountAndDeploy(
    'FungibleToken',
    mainAccount
  );

  await deployer.createAccountAndDeploy(
    'NonFungibleToken', 
    mainAccount
  );

  await deployer.createAccountAndDeploy(
    'Kitty', 
    mainAccount
  );
  
  await deployer.createAccountAndDeploy(
    'Tuna', 
    mainAccount
  );

  // user Joe account
  let accountJoe = deployer.getAccount({});

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
    transaction: deployer.getTransaction('setup_account_tuna'),
    args: [],
    proposer: accountJoe,
    payer: mainAccount,
    authorizations: [accountJoe]
  });

  console.log('account joe tuna setup');
  console.log(result);

  result = await accountJoe.sendScript({
    script: deployer.getScript('get_collection_ids'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)]
  });

  console.log('account joe collections');
  console.log(result);

  const kittyAccount = deployer.getAccountWithContract('Kitty');
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

  const tunaAccount = deployer.getAccountWithContract('Tuna');
  result = await tunaAccount.sendTransaction({
    transaction: deployer.getTransaction('mint_tuna'),
    args: [
      fcl.arg(accountJoe.getAddress(), t.Address),
      fcl.arg("100.0", t.UFix64)
    ],
    proposer: tunaAccount,
    authorizations: [tunaAccount],
    payer: mainAccount
  });

  console.log('mint tuna');
  console.log(result);

  result = await mainAccount.sendScript({
    script: deployer.getScript('get_tuna_balance'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)]
  });

  console.log('tuna balance');
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

  console.log("tuna feeded");
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
    script: deployer.getScript('get_tuna_balance'),
    args: [ fcl.arg(accountJoe.getAddress(), t.Address) ]
  });

  console.log('new tuna balance');
  console.log(result);


  result = await mainAccount.sendScript({
    script: deployer.getScript('get_kitten'),
    args: [ 
      fcl.arg(accountJoe.getAddress(), t.Address),
      fcl.arg(1, t.UInt64)
    ]
  })

  console.log('got kitty');
  console.log(result);



})().catch(err => console.log(err));