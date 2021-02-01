const { fetch } = require('whatwg-fetch');

const api = "http://localhost:8888";

const getFlowAll = async () => 
  fetch(`${api}/flow`).then(res => res.json());

const getTokens = async (address) => 
  fetch(`${api}/tokens`, { 
    method: 'POST', 
    body: JSON.stringify({ address: address }) 
  });

const getKitten = async (address) => 
  fetch(`${api}/kittens`, { 
    method: 'POST', 
    body: JSON.stringify({ address: address }) 
  });


module.exports = {
  getFlowAll, 
  getTokens, 
  getKitten 
};