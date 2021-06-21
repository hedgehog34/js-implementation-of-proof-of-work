// https://itnext.io/writing-a-blockchain-in-node-js-cd3e903226cf

const SHA256 = require("crypto-js/sha256");

// const testBlock = {
//   data: {
//     sender:   "x3041d34134g22d",
//     receiver: "x89sj8ak2l9al18",
//     amount:   0.0012,
//     currency: "BTC"
//   },
//   timestamp: 1568481293771,
//   previousHash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
// }

// console.log(calculateHash(testBlock)) // a208708a310ab5d97729ed5b7cc264ccef2b1959e83603ee1b9d4099ab4982fb

function generateGenesisBlock() {
  const block = {
    timestamp: +new Date(),
    data: "Genesis Block",
    previousHash: "0"
  };
  return {
    ...block,
    hash: calculateHash(block)
  };
}

function calculateHash({ previousHash, timestamp, data, nonce = 1 }) {
  return SHA256(
    previousHash + timestamp + JSON.stringify(data) + nonce
  ).toString();
}

function checkDifficulty(difficulty, hash) {
  return hash.substr(0, difficulty) === "0".repeat(difficulty);
}

function updateHash(block) {
  return { ...block, hash: calculateHash(block) };
}

function nextNonce(block) {
  return updateHash({ ...block, nonce: block.nonce + 1 });
}

function trampoline(func) {
  let result = func.apply(func, ...arguments);
  while (result && typeof result === "function") {
    result = result();
  }
  return result;
}

function mineBlock(difficulty, block) {
  function mine(block) {
    const newBlock = nextNonce(block);
    return checkDifficulty(difficulty, newBlock.hash)
      ? newBlock
      : () => mine(nextNonce(block));
  }
  return trampoline(mine(nextNonce(block)));
}

function addBlock(chain, data) {
  const difficulty = 4;

  const { hash: previousHash } = chain[chain.length - 1];
  const block = { timestamp: +new Date(), data, previousHash, nonce: 0 };
  const newBlock = mineBlock(difficulty, block);
  const newChain = [...chain, newBlock];
  console.log(`chain is ${validateChain(newChain) ? "valid" : "invalid"}`);
  return validateChain(newChain) ? newChain : chain;
}

function validateChain(chain) {
  function tce(chain, index) {
    if (index === 0) return true;
    const { hash, ...currentBlockWithoutHash } = chain[index];
    const currentBlock = chain[index];
    const previousBlock = chain[index - 1];
    const isValidHash = hash === calculateHash(currentBlockWithoutHash);
    const isPreviousHashValid =
      currentBlock.previousHash === previousBlock.hash;
    const isValidChain = isValidHash && isPreviousHashValid;

    if (!isValidChain) return false;
    else return tce(chain, index - 1);
  }
  return tce(chain, chain.length - 1);
}

const chain = [generateGenesisBlock()];

const newBlockData = {
  sender: "ks829fh28192j28d9dk9",
  receiver: "ads8d91w29jsm2822910",
  amount: 0.0023,
  currency: "BTC"
};

const newChain = addBlock(chain, newBlockData);
console.log("new updated chain", newChain);
