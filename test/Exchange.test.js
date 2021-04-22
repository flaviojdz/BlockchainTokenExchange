import Web3 from "web3";
import { ETHER_ADDRESS, EVMrevert, ethers, tokens } from "./helpers";
const Exchange = artifacts.require("./Exchange");
const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Exchange", ([deployer, feeAccount, user1, user2]) => {
  let token;
  let exchange;
  const feePercent = 10;
  beforeEach(async () => {
    token = await Token.new();

    token.transfer(user1, tokens(100), { from: deployer });

    exchange = await Exchange.new(feeAccount, feePercent);
  });
  describe("deployment", () => {
    it("tracks the fee account", async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });
    it("tracks the fee percent", async () => {
      const result = await exchange.feePercent();
      result.toString().should.equal(feePercent.toString());
    });
  });

  describe("fallback", () => {
    it("reverts when ether is sent", async () => {
      await exchange
        .sendTransaction({
          from: user1,
          value: 1,
        })
        .should.be.rejectedWith(EVMrevert);
    });
  });

  describe("depositing Ether", async () => {
    let result;
    let amount;
    beforeEach(async () => {
      amount = ethers(1);
      result = await exchange.depositEther({ from: user1, value: amount });
    });

    it("tracks the Ether deposit", async () => {
      const balance = await exchange.tokens(ETHER_ADDRESS, user1);
      balance.toString().should.equal(amount.toString());
    });
    it("emits a Deposit events", async () => {
      const log = result.logs[0];
      log.event.should.equal("Deposit");

      const event = log.args;
      event.token.should.be.equal(ETHER_ADDRESS, "token address is correct");
      event.user.should.be.equal(user1, "user is correct");
      event.amount
        .toString()
        .should.be.equal(amount.toString(), "amount is correct");
      event.balance
        .toString()
        .should.be.equal(amount.toString(), "balance is correct");
    });
  });

  describe("withdraw Ether", async () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = ethers(1);
      await exchange.depositEther({ from: user1, value: amount });
    });

    describe("success", async () => {
      beforeEach(async () => {
        amount = ethers(1);
        result = await exchange.withdrawEther(amount, { from: user1 });
      });
      it("withdraws Ether funds", async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal("0");
      });
      it("emits a Withdraw events", async () => {
        const log = result.logs[0];
        log.event.should.equal("Withdraw");

        const event = log.args;
        event.token.should.be.equal(ETHER_ADDRESS, "token address is correct");
        event.user.should.be.equal(user1, "user is correct");
        event.amount
          .toString()
          .should.be.equal(amount.toString(), "amount is correct");
        event.balance
          .toString()
          .should.be.equal("0".toString(), "balance is correct");
      });
    });
    describe("failure", async () => {
      it("withdraws Ether funds", async () => {
        await exchange
          .withdrawEther(ethers(100), { from: user1 })
          .should.be.rejectedWith(EVMrevert);
      });
    });
  });

  describe("depositing tokens", () => {
    let result;
    let amount;

    describe("success", () => {
      beforeEach(async () => {
        amount = tokens(10);
        await token.approve(exchange.address, amount, { from: user1 });
        result = await exchange.depositToken(token.address, amount, {
          from: user1,
        });
      });
      it("traks the token deposit", async () => {
        let balance;
        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });
      it("emits a Deposit events", async () => {
        const log = result.logs[0];
        log.event.should.equal("Deposit");

        const event = log.args;
        event.token.should.be.equal(token.address, "token address is correct");
        event.user.should.be.equal(user1, "user is correct");
        event.amount
          .toString()
          .should.be.equal(amount.toString(), "amount is correct");
        event.balance
          .toString()
          .should.be.equal(amount.toString(), "balance is correct");
      });
    });
    describe("failure", () => {
      it("rejects Ether deposits", async () => {
        await exchange
          .depositToken(ETHER_ADDRESS, amount, {
            from: user1,
          })
          .should.be.rejectedWith(EVMrevert);
      });
      it("fails when no tokens are approved", async () => {
        await exchange
          .depositToken(token.address, amount, { from: user1 })
          .should.be.rejectedWith(EVMrevert);
      });
    });
  });

  describe("withdraw tokens", async () => {
    let amount;
    let result;

    describe("success", async () => {
      beforeEach(async () => {
        amount = tokens(10);
        await token.approve(exchange.address, amount, { from: user1 });
        await exchange.depositToken(token.address, amount, { from: user1 });

        result = await exchange.withdrawToken(token.address, amount, {
          from: user1,
        });
      });
      it("withdraws token funds", async () => {
        const balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal("0");
      });
      it("emits a Withdraw events", async () => {
        const log = result.logs[0];
        log.event.should.equal("Withdraw");

        const event = log.args;
        event.token.should.be.equal(token.address, "token address is correct");
        event.user.should.be.equal(user1, "user is correct");
        event.amount
          .toString()
          .should.be.equal(amount.toString(), "amount is correct");
        event.balance
          .toString()
          .should.be.equal("0".toString(), "balance is correct");
      });
    });
    describe("failure", async () => {
      beforeEach(async () => {
        amount = tokens(10);
      });
      it("rejects Ether withdraws", async () => {
        await exchange
          .withdrawToken(ETHER_ADDRESS, amount, {
            from: user1,
          })
          .should.rejectedWith(EVMrevert);
      });
      it("fails insufficient balances", async () => {
        await exchange
          .withdrawToken(token.address, amount, {
            from: user1,
          })
          .should.rejectedWith(EVMrevert);
      });
    });
  });
  describe("checking balances", async () => {
    let amount;
    beforeEach(async () => {
      amount = ethers(1);
      await exchange.depositEther({ from: user1, value: amount });
    });
    it("returns user balance", async () => {
      const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
      result.toString().should.equal(amount.toString());
    });
  });
  describe("making orders", async () => {
    let amountEth;
    let amountTok;
    let result;
    beforeEach(async () => {
      amountEth = ethers(1);
      amountTok = tokens(1);
      result = await exchange.makeOrder(
        token.address,
        amountTok,
        ETHER_ADDRESS,
        amountEth,
        { from: user1 }
      );
    });
    it("traks the newly created order", async () => {
      const orderCount = await exchange.orderCount();
      orderCount.toString().should.equal("1");
      const order = await exchange.orders("1");
      order.id.toString().should.be.equal("1", "id is correct");
      order.user.should.be.equal(user1, "user is correct");
      order.tokenGet.should.equal(token.address, "tokenGet is correct");
      order.amountGet
        .toString()
        .should.equal(amountTok.toString(), "amountGive is correct");
      order.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct");
      order.amountGive
        .toString()
        .should.equal(amountEth.toString(), "amountGive is correct");
      order.timestamp
        .toString()
        .length.should.be.at.least(1, "timestamp exists");
    });
    it("emits an Order events", async () => {
      const log = result.logs[0];
      log.event.should.equal("Order");

      const event = log.args;
      event.id.toString().should.be.equal("1", "id is correct");
      event.user.should.be.equal(user1, "user is correct");
      event.tokenGet.should.equal(token.address, "tokenGet is correct");
      event.amountGet
        .toString()
        .should.equal(amountTok.toString(), "amountGive is correct");
      event.tokenGive.should.equal(ETHER_ADDRESS, "tokenGet is correct");
      event.amountGive
        .toString()
        .should.equal(amountEth.toString(), "amountGive is correct");
      event.timestamp
        .toString()
        .length.should.be.at.least(1, "timestamp exists");
    });
  });
  describe("order actions", async () => {
    let amountEth;
    let amountTok;
    let feeAmount;
    let tokenAmount;
    let result;
    beforeEach(async () => {
      amountEth = ethers(1);
      amountTok = tokens(1);
      feeAmount = 0.1;
      tokenAmount = 1;
      await exchange.depositEther({ from: user1, value: amountEth });
      await token.transfer(user2, tokens(100), { from: deployer });
      await token.approve(exchange.address, tokens(2), { from: user2 });
      await exchange.depositToken(token.address, tokens(2), { from: user2 });
      await exchange.makeOrder(
        token.address,
        amountTok,
        ETHER_ADDRESS,
        amountEth,
        { from: user1 }
      );
    });
    describe("filling orders", async () => {
      describe("success", () => {
        beforeEach(async () => {
          result = await exchange.fillOrder("1", { from: user2 });
        });
        it("executes the trade & charges fees", async () => {
          let balance;
          balance = await exchange.balanceOf(token.address, user1);
          balance
            .toString()
            .should.equal(
              tokens(tokenAmount).toString(),
              "user1 received tokens"
            );
          balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
          balance
            .toString()
            .should.equal(ethers(1).toString(), "user2 received Ether");
          balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
          balance.toString().should.equal("0", "user1 Ether deducted");
          balance = await exchange.balanceOf(token.address, user2);
          balance
            .toString()
            .should.equal(
              tokens(tokenAmount * (1 - feeAmount)).toString(),
              "user2 tokens deducted with fee applied"
            );
          const feeAccount = await exchange.feeAccount();
          balance = await exchange.balanceOf(token.address, feeAccount);
          balance
            .toString()
            .should.equal(
              tokens(feeAmount).toString(),
              "feeAccount received fee"
            );
        });

        it("updates filled orders", async () => {
          const orderFilled = await exchange.ordersFilled(1);
          orderFilled.should.equal(true);
        });

        it('emits a "Trade" event', () => {
          const log = result.logs[0];
          log.event.should.eq("Trade");
          const event = log.args;
          event.id.toString().should.equal("1", "id is correct");
          event.user.should.equal(user1, "user is correct");
          event.tokenGet.should.equal(token.address, "tokenGet is correct");
          event.amountGet
            .toString()
            .should.equal(
              tokens(tokenAmount).toString(),
              "amountGet is correct"
            );
          event.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct");
          event.amountGive
            .toString()
            .should.equal(ethers(1).toString(), "amountGive is correct");
          event.userFill.should.equal(user2, "userFill is correct");
          event.timestamp
            .toString()
            .length.should.be.at.least(1, "timestamp is present");
        });
      });

      describe("failure", () => {
        it("rejects invalid order ids", () => {
          const invalidOrderId = 99999;
          exchange
            .fillOrder(invalidOrderId, { from: user2 })
            .should.be.rejectedWith(EVMrevert);
        });

        it("rejects already-filled orders", () => {
          exchange.fillOrder("1", { from: user2 }).should.be.fulfilled;
          exchange
            .fillOrder("1", { from: user2 })
            .should.be.rejectedWith(EVMrevert);
        });

        it("rejects cancelled orders", () => {
          exchange.cancelOrder("1", { from: user1 }).should.be.fulfilled;
          exchange
            .fillOrder("1", { from: user2 })
            .should.be.rejectedWith(EVMrevert);
        });
      });
    });
    describe("canceling orders", async () => {
      describe("success", async () => {
        beforeEach(async () => {
          result = await exchange.cancelOrder(1, { from: user1 });
        });
        it("updates cancelled orders", async () => {
          const orderCancelled = await exchange.ordersCancelled(1);
          orderCancelled.should.equal(true);
        });
        it("emits a Cancel event", async () => {
          const log = result.logs[0];
          log.event.should.equal("Cancel");

          const event = log.args;
          event.id.toString().should.be.equal("1", "id is correct");
          event.user.should.be.equal(user1, "user is correct");
          event.tokenGet.should.equal(token.address, "tokenGet is correct");
          event.amountGet
            .toString()
            .should.equal(amountTok.toString(), "amountGive is correct");
          event.tokenGive.should.equal(ETHER_ADDRESS, "tokenGet is correct");
          event.amountGive
            .toString()
            .should.equal(amountEth.toString(), "amountGive is correct");
          event.timestamp
            .toString()
            .length.should.be.at.least(1, "timestamp exists");
        });
      });
      describe("failure", async () => {
        it("rejects invalid order ids", async () => {
          const invalidOrderId = 999999;
          await exchange
            .cancelOrder(invalidOrderId, { from: user1 })
            .should.be.rejectedWith(EVMrevert);
        });
        it("rejects unauthorized cancelations", async () => {
          const invalidOrderId = 999999;
          await exchange
            .cancelOrder(1, { from: user2 })
            .should.be.rejectedWith(EVMrevert);
        });
      });
    });
  });
});
