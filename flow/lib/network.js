
class Network {
  #host

  constructor(host) {
    this.#host = host;
  }

  getHost() {
    return this.#host;
  }

}

module.exports = Network;