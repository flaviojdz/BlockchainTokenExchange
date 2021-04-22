export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

export const DECIMALS = 10 ** 18;

export const ethers = (wei) => {
  if (!wei) {
    return null;
  }
  return wei / DECIMALS;
};

export const tokens = (wei) => ethers(wei);

export const RED = "danger";

export const GREEN = "success";
