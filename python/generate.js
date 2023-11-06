const fs = require('fs');
const path = require("path");
const { poseidon } = require("circomlibjs");
const hash = require("circomlibjs").poseidon;
const F = require("circomlibjs").babyjub.F;
const { merkelize, getMerkleProof, isMerkleProofValid } = require("./mkt2.js");


function generateInputJSON(nLevels, identityNullifier, identityTrapdoor, auctionIndex, balanceIndex, auctionId, balance, bid, nonce) {
    // Generate the auction and balance trees
    const auctionLeaves = new Array(nLevels).fill(0).map((_, i) => F.e(i + auctionId));
    const balanceLeaves = new Array(nLevels).fill(0).map((_, i) => F.e(i + balance));
    const auctionTree = merkelize(F, hash, auctionLeaves, nLevels);
    const balanceTree = merkelize(F, hash, balanceLeaves, nLevels);

    // Extract the roots
    const auctionRoot = auctionTree[0];
    const balanceRoot = balanceTree[0];

    // Get the Merkle proofs for the given indices
    const auctionTreeSiblings = getMerkleProof(auctionTree, auctionIndex, nLevels);
    const balanceTreeSiblings = getMerkleProof(balanceTree, balanceIndex, nLevels);

    // Debugging: Check if the proofs are valid
    const auctionValue = auctionLeaves[auctionIndex];
    const balanceValue = balanceLeaves[balanceIndex];
    const isAuctionProofValid = isMerkleProofValid(F, hash, auctionIndex, auctionValue, auctionRoot, auctionTreeSiblings);
    const isBalanceProofValid = isMerkleProofValid(F, hash, balanceIndex, balanceValue, balanceRoot, balanceTreeSiblings);

    // Log debugging information
    console.log('Auction value:', auctionValue.toString());
    console.log('Balance value:', balanceValue.toString());
    console.log('Is auction proof valid?', isAuctionProofValid);
    console.log('Is balance proof valid?', isBalanceProofValid);

    // Construct the input object
    const input = {
        identityNullifier: identityNullifier,
        identityTrapdoor: identityTrapdoor,
        auctionIndex: auctionIndex,
        auctionTreeSiblings: auctionTreeSiblings.map(x => x.toString()),
        balanceTreeSiblings: balanceTreeSiblings.map(x => x.toString()),
        auctionId: auctionId,
        balance: balance,
        bid: bid,
        nonce: nonce,
        auctionRoots: new Array(nLevels).fill(auctionRoot.toString()),
        balanceRoot: balanceRoot.toString(),
        balanceIndex: balanceIndex
    };

    // Serialize and write the input to a JSON file
    const jsonContent = JSON.stringify(input, null, 4);
    fs.writeFileSync('input.json', jsonContent);
}
// Example usage:
generateInputJSON(
    20, // nLevels
    123456789, // identityNullifier
    987654321, // identityTrapdoor
    1, // auctionIndex
    1, // balanceIndex
    999, // auctionId
    100000, // balance
    5000, // bid
    123 // nonce
);