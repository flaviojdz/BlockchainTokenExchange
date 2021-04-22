export const EVMrevert = "VM Exception while processing transaction: revert";

export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

export const ethers = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

const wait = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const tokens = (n) => ethers(n);
