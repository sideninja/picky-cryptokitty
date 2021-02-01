const deployer = require('../migrations/deployer');
const fcl = require('@onflow/fcl');
const t = require('@onflow/types');

/**
 * Mint hairballs ft token for account and specific amount
 * @param {*} address address of the receiver of tokens
 * @param {*} amount amount of tokens to be minted
 */
async function mintHairBalls(address, amount) {
  console.log(`minting ${amount} tokens for ${address}`);

  const hairballAccount = deployer.getAccountWithContract('HairBall');

  result = await hairballAccount.sendTransaction({
    transaction: deployer.getTransaction('mint_hairballs'),
    args: [
      fcl.arg(address, t.Address),
      fcl.arg(amount, t.UFix64)
    ],
    proposer: hairballAccount,
    authorizations: [hairballAccount],
    payer: hairballAccount
  });

  return result;
}

/**
 * Mint a new unique kitten for address 
 * @param {*} address address of the kitten receiver 
 */
async function mintKittens(address) {
  console.log(`minting kitty for ${address}`);

  const kittyAccount = deployer.getAccountWithContract('Kitty');

  result = await kittyAccount.sendTransaction({
    transaction: deployer.getTransaction('mint_kittens'),
    args: [fcl.arg(address, t.Address)],
    proposer: kittyAccount,
    payer: kittyAccount,
    authorizations: [kittyAccount]
  });

  return result;
}

/**
 * Update kitten for the address
 */
async function updateKitten(address) {
  console.log(`udpate kitten for ${address}`);

  const kittyAccount = deployer.getAccountWithContract('Kitty');

  result = await kittyAccount.sendTransaction({
    transaction: deployer.getTransaction('check_kitten'),
    args: [
      fcl.arg(address, t.Address),
      fcl.arg(1, t.UInt64)
    ],
    proposer: kittyAccount,
    authorizations: [kittyAccount],
    payer: kittyAccount
  });
}


module.exports = { mintHairBalls, mintKittens, updateKitten };