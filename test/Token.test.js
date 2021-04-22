import { EVMrevert, tokens } from "./helpers";
const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Token", ([deployer, receiver, exchange]) => {
  const name = "J Token";
  const symbol = "J23";
  const decimals = "18";
  const totalSupply = tokens(1000000).toString();
  let token;
  beforeEach(async () => {
    token = await Token.new();
  });
  describe("deployment", () => {
    it("tracks the name", async () => {
      const result = await token.name();
      result.should.equal(name);
    });
    it("tracks the symbol", async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    });
    it("tracks the decimals", async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    });
    it("tracks the supply", async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply);
    });
    it("assigns the total supply to the deployer", async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply);
    });
  });
  describe("sending tokens", () => {
    let amount;
    let result;

    describe("success", async () => {
      beforeEach(async () => {
        amount = tokens(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      });
      it("transfer token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(amount.toString());
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(999900).toString());
      });
      it("emits a transfer events", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");

        const event = log.args;
        event.from.toString().should.be.equal(deployer, "from is correct");
        event.to.toString().should.be.equal(receiver, "to is correct");

        event.value
          .toString()
          .should.be.equal(amount.toString(), "to is correct");
      });
    });
    describe("failure", async () => {
      beforeEach(async () => {
        amount = tokens(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      });
      it("rejects insufficient balance", async () => {
        let invalidAmount;
        invalidAmount = tokens(100000000);
        await token
          .transfer(receiver, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVMrevert);
        invalidAmount = tokens(10);
        await token
          .transfer(deployer, tokens(101), { from: receiver })
          .should.be.rejectedWith(EVMrevert);
      });
      it("rejects invalid recipients", async () => {
        await token.transfer("0x0", amount, {
          from: deployer,
        }).should.be.rejected;
      });
    });
  });
  describe("approving tokens", () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = tokens(100);
      result = await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", () => {
      it("allocates an allowance for delegated token transfer", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      });
      it("emits an approval event", async () => {
        const log = result.logs[0];
        log.event.should.eq("Approval");
        const event = log.args;
        event.owner.toString().should.equal(deployer, "owner is correect");
        event.spender.should.eq(exchange, "spender is correct");
        event.value.toString().should.eq(amount.toString(), "value is correct");
      });
    });

    describe("failure", () => {
      it("rejects invalid recipients", async () => {
        await token.approve("0x0", amount, {
          from: deployer,
        }).should.be.rejected;
      });
    });
  });
  describe("delegated token transfers", () => {
    let amount;
    let result;
    beforeEach(async () => {
      amount = tokens(100);
      await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", async () => {
      beforeEach(async () => {
        result = await token.transferFrom(deployer, receiver, amount, {
          from: exchange,
        });
      });
      it("transfer token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(amount.toString());
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(999900).toString());
      });
      it("emits a transfer events", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");

        const event = log.args;
        event.from.toString().should.be.equal(deployer, "from is correct");
        event.to.toString().should.be.equal(receiver, "to is correct");

        event.value
          .toString()
          .should.be.equal(amount.toString(), "to is correct");
      });
      it("it resets the allowece", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal("0");
      });
    });
    describe("failure", async () => {
      beforeEach(async () => {
        amount = tokens(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      });
      it("rejects insufficient balance", async () => {
        let invalidAmount;
        invalidAmount = tokens(100000000);
        await token
          .transferFrom(deployer, receiver, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVMrevert);
      });
      it("rejects invalid recipients", async () => {
        await token.transferFrom(deployer, "0x0", amount, {
          from: exchange,
        }).should.be.rejected;
      });
    });
  });
});
