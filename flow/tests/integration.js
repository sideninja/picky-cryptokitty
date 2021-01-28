const Network = require('../lib/network');
const Account = require('../lib/account');
const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const config = require("config");
const deployer = require('../migrations/deploy');



(async() => {
  //await helpers.runEmulator();
  
  await deployer.deployAll();

  const network = new Network({ node: config.get("flow.network") });
  
  // main account from flow emulator
  const mainAccount = deployer.getAccount({ 
    address: config.get("accounts.main.address"), 
    network
  });

  // user Joe account
  let accountJoe = deployer.getAccount({ network });

  accountJoe = await accountJoe.create({
    proposer: mainAccount,
    payer: mainAccount,
    authorizations: [mainAccount]
  });

  console.log('account joe created', accountJoe.getAddress());

  let result = await accountJoe.sendTransaction({
    transaction: deployer.getTransaction('setup_account'),
    args: [],
    proposer: accountJoe,
    payer: mainAccount,
    authorizations: [accountJoe],
    network
  });

  console.log('account joe setup');
  console.log(result);

  result = await accountJoe.sendScript({
    script: deployer.getScript('get_collection_ids'), 
    args: [fcl.arg(accountJoe.getAddress(), t.Address)],
    network
  });
 
  console.log('account joe collections');
  console.log(result);

  const kittyAccount = deployer.getAccountWithContract('Kitty', network);
  result = await kittyAccount.sendTransaction({
    transaction: deployer.getTransaction('mint_kittens'),
    args: [fcl.arg(accountJoe.getAddress(), t.Address)],
    proposer: kittyAccount,
    payer: kittyAccount,
    authorizations: [kittyAccount],
    network
  });

  console.log('kitty minting');
  console.log(result);

  result = await accountJoe.sendScript({
    script: deployer.getScript('get_collection_ids'), 
    args: [fcl.arg(accountJoe.getAddress(), t.Address)],
    network
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
    payer: mainAccount,
    network
  });
  
  console.log('check kitty');
  console.log(result);


})().catch(err => console.log(err));