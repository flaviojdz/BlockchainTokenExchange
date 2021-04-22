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
  try {
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

    amount = 1;
    await exchange.depositEther({ from: user1, value: ethers(amount) });
    console.log(`Deposited ${amount} Ether from ${user1}`);

    amount = 10000;
    await token.approve(exchange.address, tokens(amount), { from: user2 });
    console.log(`Approved ${amount} Ether from ${user2}`);
    await exchange.depositToken(token.address, tokens(amount), { from: user2 });
    console.log(`Deposited ${amount} Ether from ${user2}`);

    let result;
    let orderId;
    result = await exchange.makeOrder(
      token.address,
      tokens(100),
      ETHER_ADDRESS,
      ethers(0.1),
      { from: user1 }
    );
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.cancelOrder(orderId, { from: user1 });
    console.log(`Cancelled order from ${user1}`);

    result = await exchange.makeOrder(
      token.address,
      tokens(100),
      ETHER_ADDRESS,
      ethers(0.1),
      { from: user1 }
    );
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user2 });
    console.log(`Filled order from ${user2}`);

    await wait(1);

    result = await exchange.makeOrder(
      token.address,
      tokens(50),
      ETHER_ADDRESS,
      ethers(0.01),
      { from: user1 }
    );
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user2 });
    console.log(`Filled order from ${user2}`);

    await wait(1);

    result = await exchange.makeOrder(
      token.address,
      tokens(200),
      ETHER_ADDRESS,
      ethers(0.15),
      { from: user1 }
    );
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user2 });
    console.log(`Filled order from ${user2}`);

    await wait(1);

    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(
        token.address,
        tokens(10 * i),
        ETHER_ADDRESS,
        ethers(0.01),
        { from: user1 }
      );
      console.log(`Made order from ${user1}`);
      await wait(1);
    }

    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(
        ETHER_ADDRESS,
        ethers(0.01),
        token.address,
        tokens(10 * i),
        { from: user2 }
      );
      console.log(`Made order from ${user2}`);
      await wait(1);
    }
  } catch (error) {
    console.log(error);
  }
  callback();
};
