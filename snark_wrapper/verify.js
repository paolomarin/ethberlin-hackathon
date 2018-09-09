const env = process.env;

// don't load .env file in prod
if (env.NODE_ENV !== 'production') {
    require('dotenv').load();
}





//Provider Engine sub-modules

const ProviderEngine = require('web3-provider-engine')
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js')
const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js')
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
const VmSubprovider = require('web3-provider-engine/subproviders/vm.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')

//EthereumJS Wallet Sub-Provider

const WalletSubprovider = require('ethereumjs-wallet/provider-engine')
const walletFactory = require('ethereumjs-wallet')

//Web3 Module

const Web3 = require('web3')

//Wallet Initialization

var privateKey = "3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266"
var privateKeyBuffer = new Buffer(privateKey, "hex")
var myWallet = walletFactory.fromPrivateKey(privateKeyBuffer)

//Engine initialization & sub-provider attachment

var engine = new ProviderEngine();

engine.addProvider(new FixtureSubprovider({
  web3_clientVersion: 'ProviderEngine/v0.0.0/javascript',
  net_listening: true,
  eth_hashrate: '0x00',
  eth_mining: false,
  eth_syncing: true,
}))

// cache layer
engine.addProvider(new CacheSubprovider())

// filters
engine.addProvider(new FilterSubprovider())

// pending nonce
engine.addProvider(new NonceSubprovider())

// vm
engine.addProvider(new VmSubprovider())

// Here the URL can be your localhost for TestRPC or the Infura URL
engine.addProvider(new RpcSubprovider({
  rpcUrl: 'https://mainnet.infura.io/'+env.INFURA_TOKEN,
}))

// Wallet Attachment
engine.addProvider(new WalletSubprovider(myWallet))

// network connectivity error
engine.on('error', function(err){
  // report connectivity errors
  console.error(err.stack)
})

// start polling for blocks
engine.start()

//Actual Initialization of the web3 module

var web3 = new Web3(engine)







var Web3 = require('web3');
var Solidity = require('solc')
var fs = require("fs");
var BigNumber = require('bignumber.js');

// get verifcation key, proving key 
var proof = require('./zksnark_element/proof.json');


var code = fs.readFileSync("./contracts/TrustedResource.sol", "utf8");
var address = fs.readFileSync("address.txt", "utf8");
var compiled = Solidity.compile(code, 1)

var bytecode = compiled.contracts[":TrustedResource"].bytecode;
var abi = compiled.contracts[":TrustedResource"].interface;
var abi = JSON.parse(abi);
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
 

var TrustedResource = web3.eth.contract(abi);
TrustedResource_deployed = TrustedResource.at(address);
TrustedResource_deployed.submit.sendTransaction(
  proof.a,
  proof.a_p,
  proof.b,
  proof.b_p,
  proof.c,
  proof.c_p,
  proof.h,
  proof.k,
  proof.input,
  {from:web3.eth.accounts[1], gas:2000000, value:"200000000"});


