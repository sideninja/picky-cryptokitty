const EC = require("elliptic").ec;
const SHA3 = require("sha3").SHA3;
const fcl = require("@onflow/fcl");
const sdk = require("@onflow/sdk");
const rlp = require("@onflow/rlp");
const t = require("@onflow/types");

const ec = new EC("p256");


class Account {
  #address;
  #publicKey;
  #privateKey;
  #keyIndex;
  #network;

  constructor({ address, privateKey, keyIndex, network, publicKey }) {
    this.#address = address;
    this.#privateKey = privateKey;
    this.#keyIndex = keyIndex;
    this.#network = network;
    this.#publicKey = publicKey;
  }

  /**
   * Hash message method is used to make a sha3 signature from content
   * @param {string} message 
   */
  #hash(message) {
    const sha = new SHA3(256);
    sha.update(Buffer.from(message, "hex"));
    return sha.digest();
  }

  /**
   * Encode public key to format expected by flow
   * @param {string} publicKey 
   */
  #encodePublicKey() {
    return rlp
      .encode([Buffer.from(this.#publicKey, "hex"), 2, 3, 1000])
      .toString("hex");
  } 

  /**
   * Generate new key pair for account
   */
  #assignNewKeys() {
    if (this.#privateKey != undefined || this.#publicKey != undefined) {
      throw new Error('account must be empty to generate keys');
    }

    const keys = ec.genKeyPair();
    this.#privateKey = keys.getPrivate("hex");
    this.#publicKey = keys.getPublic("hex").replace(/^04/, "");
  }

  /**
   * Check if account is empty / without keys
   */
  #isEmpty() {
    // todo change to something better
    return this.#privateKey == undefined && this.#publicKey == undefined;
  }

  /**
   * Return balance for this account
   */
  async getBalance() {
    let response = await fcl.send([
      fcl.getAccount(this.#address)
    ], this.#network.getHost());

    return response.account.balance;
  }

  /**
   * Get account address
   */
  getAddress() {
    return this.#address;
  }

  /**
   * Load account from the flow network
   */
  async get() {
    let { account } = await fcl.send([
      fcl.getAccount(this.#address)
    ], this.#network.getHost());
    
    return account;
  }

  /**
   * Make a signature from the message by using account private key and hashing algo
   * @param {string} message 
   */
  async sign(message) {
    const key = ec.keyFromPrivate(Buffer.from(this.#privateKey, "hex"));
    const sig = key.sign(this.#hash(message));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);

    return Buffer.concat([r, s]).toString("hex");
  }

  /**
   * Create authorization object needed for transactions with sequqnce number if acc is proposer
   */
  async authorize() {
    return async (account) => {
      const acc = await this.get();
      const key = acc.keys[this.#keyIndex];
    
      let sequenceNum;
      if (account.role.proposer) {
        sequenceNum = key.sequenceNumber;
      }

      const signingFunction = async (data) => {
        return {
          addr: acc.address,
          keyId: key.index,
          signature: await this.sign(data.message),
        };
      };
      
      return {
        ...account,
        addr: acc.address,
        keyId: key.index,
        sequenceNum,
        signature: account.signature || null,
        signingFunction,
        resolve: null,
        roles: account.roles,
      };
    } 
    
  }

  /**
   * Deploy new contract to the account
   * @param {string} name 
   * @param {string} code 
   * @param {authorizer object} proposer 
   * @param {authorizer object} authorizations 
   * @param {authorizer object} payer 
   */
  async addContract(name, code, proposer, authorizations, payer) {
    code = Buffer.from(code, "utf8").toString("hex");
    
    const response = await fcl.send([
      fcl.transaction`
        transaction(name: String, code: String) {
          let signer: AuthAccount
          prepare(signer: AuthAccount) {
            self.signer = signer
          }
          execute {
            self.signer.contracts.add(
              name: name,
              code: code.decodeHex()
            )
          }
        }
      `,
      fcl.args([fcl.arg(name, t.String), fcl.arg(code, t.String)]),
      fcl.proposer(proposer || await this.authorize()),
      fcl.authorizations([authorizations || await this.authorize()]),
      fcl.payer(payer || await this.authorize()),
      fcl.limit(9999),
    ], this.#network.getHost());

    return fcl.tx(response).onceSealed();
  }

  async sendScript({ script, args, network }) {
    const response = await fcl.send([fcl.script`${script}`, fcl.args(args)], network.getHost());
    return await fcl.decode(response);
  }

  async sendTransaction({ transaction, args, proposer, payer, authorizations, network }) {
    const response = await fcl.send([
      fcl.transaction`${transaction}`,
      fcl.args(args),
      fcl.proposer(await proposer.authorize()),
      fcl.authorizations([ await authorizations[0].authorize() ]),
      fcl.payer(await payer.authorize()),
      fcl.limit(9999),
    ], network.getHost());

    return await fcl.tx(response).onceSealed();
  };

  /**
   * Create an account on the flow network
   * @param {authorizer object} proposer 
   * @param {authorizer object} authorizations 
   * @param {authorizer object} payer 
   */ 
  async create({ proposer, payer, authorizations }) {
    if (this.#isEmpty()) {
      this.#assignNewKeys();
      console.error(`account was empty so created new keys for you: pub: ${this.#publicKey} priv: ${this.#privateKey}`);
    }

    const encodedKey = this.#encodePublicKey();
    
    const response = await fcl.send([
      fcl.transaction`
        transaction(publicKey: String) {
          let payer: AuthAccount
          prepare(payer: AuthAccount) {
            self.payer = payer
          }
          execute {
            let account = AuthAccount(payer: self.payer)
            account.addPublicKey(publicKey.decodeHex())
          }
        }
      `,
      fcl.args([fcl.arg(encodedKey, t.String)]),
      fcl.proposer(await proposer.authorize()),
      fcl.authorizations([ await authorizations[0].authorize() ]),
      fcl.payer(await payer.authorize()),
    ], this.#network.getHost());

    const { events } = await fcl.tx(response).onceSealed();
    
    this.#address = events
      .find(d => d.type === "flow.AccountCreated")
      .data.address;

    return this;
  }

}

module.exports = Account;
 