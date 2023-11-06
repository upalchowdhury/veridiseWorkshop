const fs = require('fs');
const path = require("path");
const { poseidon } = require("circomlibjs");
const hash = require("circomlibjs").poseidon;
const F = require("circomlibjs").babyjub.F;
const { merkelize, getMerkleProof, isMerkleProofValid } = require("./mkt2.js");



function bigIntToString(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'bigint') {
            obj[key] = obj[key].toString();
        } else if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map(element => element.toString());
        }
    }
}




function generateInputJSON(nLevels, identityNullifier, identityTrapdoor, auctionIndex, balanceIndex, auctionId, balance, bid, nonce) {
    const auctionTree = merkelize(F, hash, new Array(nLevels).fill(0).map((_, i) => i + auctionId), nLevels);
    const balanceTree = merkelize(F, hash, new Array(nLevels).fill(0).map((_, i) => i + balance), nLevels);

    const auctionRoot = auctionTree[0];
    const balanceRoot = balanceTree[0];

    const auctionTreeSiblings = getMerkleProof(auctionTree, auctionIndex, nLevels);
    const balanceTreeSiblings = getMerkleProof(balanceTree, balanceIndex, nLevels);


    console.log(isMerkleProofValid(F, hash, auctionIndex, 999, auctionRoot, auctionTreeSiblings));
    const input = {
        identityNullifier: identityNullifier,
        identityTrapdoor: identityTrapdoor,
        auctionIndex: auctionIndex,
        auctionTreeSiblings: auctionTreeSiblings,
        balanceTreeSiblings: balanceTreeSiblings,
        auctionId: auctionId,
        balance: balance,
        bid: bid,
        nonce: nonce,
        auctionRoots: new Array(nLevels).fill(auctionRoot),
        balanceRoot: balanceRoot,
        balanceIndex: balanceIndex
    };
    const jsonContent = JSON.stringify(input, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 4);
    fs.writeFileSync('input.json', jsonContent);

}

// Example usage:
generateInputJSON(
    3, // nLevels
    123456789, // identityNullifier
    987654321, // identityTrapdoor
    1, // auctionIndex
    1, // balanceIndex
    999, // auctionId
    100000, // balance
    5000, // bid
    123 // nonce
);

