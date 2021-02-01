const deployer = require('../migrations/deploy');

class Service {

  constructor() {
    // init hairballs - minter
    // init kittens - minter
    const network = new Network({ node: config.get("flow.network") });

    // main account from flow emulator
    const mainAccount = deployer.getAccount({
      address: config.get("accounts.main.address"),
      network
    });
  
    await deployer.createAccountAndDeploy(
      'HairBall', 
      mainAccount, 
      network
    );

    
  }

  mintHairBalls(address, amount) {
    const hairballAccount = deployer.getAccountWithContract('HairBall', network);

    result = await hairballAccount.sendTransaction({
      transaction: deployer.getTransaction('mint_hairballs'),
      args: [
        fcl.arg(address, t.Address),
        fcl.arg(amount, t.UFix64)
      ],
      proposer: hairballAccount,
      authorizations: [hairballAccount],
      payer: mainAccount,
      network
    });
  
  }

  mintKittens() {

  }

  

}
