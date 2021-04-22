const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

const ethers = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

const wait = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const tokens = (n) => ethers(n);

module.exports = async function (callback) {
  const accounts = await web3.eth.getAccounts();

  const token = await Token.deployed();
  console.log("Token fetched", token.address);

  const exchange = await Exchange.deployed();
  console.log("Exchange fetched", exchange.address);

  const sender = accounts[0];
  const receiver = accounts[1];

  let amount = web3.utils.toWei("10000", "ether");

  await token.transfer(receiver, amount, { from: sender });
  console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`);

  const user1 = accounts[0];
  const user2 = accounts[1];

  let result;
  for (let i = 1; i <= 10; i++) {
    result = await exchange.makeOrder(
      ETHER_ADDRESS,
      ethers(0.01),
      token.address,
      tokens(10 * i),
      { from: user2 }
    );
    console.log(`Made order from ${user2}`);
    console.log(ETHER_ADDRESS, ethers(0.01), token.address, tokens(10 * i));
    await wait(1);
  }
  callback();
};
