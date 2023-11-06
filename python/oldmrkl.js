const fs = require('fs');
const path = require("path");
const { poseidon } = require("circomlibjs");
const F = require("circomlibjs").babyjub.F;

function merkelize(arr, nLevels) {
    const extendedLen = 1 << nLevels;
    const hArr = [];

    for (let i = 0; i < extendedLen; i++) {
        if (i < arr.length) {
            hArr.push(poseidon([F.e(arr[i])]));
        } else {
            hArr.push(F.zero);
        }
    }

    return __merkelize(hArr);
}

function __merkelize(arr) {
    if (arr.length === 1) return arr;

    const hArr = [];
    for (let i = 0; i < arr.length / 2; i++) {
        hArr.push(poseidon([arr[2 * i], arr[2 * i + 1]]));
    }

    const m = __merkelize(hArr);
    return [...m, ...arr];
}

function getMerkleProof(m, key, nLevels) {
    if (nLevels === 0) return [];

    const extendedLen = 1 << nLevels;
    const topSiblings = getMerkleProof(m, key >> 1, nLevels - 1);
    const curSibling = m[extendedLen - 1 + (key ^ 1)];

    return [...topSiblings, curSibling];
}

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
    const auctionTree = merkelize(new Array(nLevels).fill(0).map((_, i) => i + auctionId), nLevels);
    const balanceTree = merkelize(new Array(nLevels).fill(0).map((_, i) => i + balance), nLevels);

    const auctionRoot = auctionTree[0];
    const balanceRoot = balanceTree[0];

    const auctionTreeSiblings = getMerkleProof(auctionTree, auctionIndex, nLevels);
    const balanceTreeSiblings = getMerkleProof(balanceTree, balanceIndex, nLevels);

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
    1234567, // identityNullifier
    9876543, // identityTrapdoor
    1, // auctionIndex
    1, // balanceIndex
    999, // auctionId
    100000, // balance
    5000, // bid
    123 // nonce
);
