from hashlib import sha256
import json

# Function to simulate hashing for a Merkle Tree
def mock_hash(val1, val2):
    # Simple hash function using XOR for simulation purposes
    return (val1 + val2) % 21888242871839275222246405745257275088548364400416034343698204186575808495617

# Function to generate a Merkle tree root and siblings for a given level
def generate_merkle_data(levels):
    # Start with an arbitrary leaf value
    leaf_value = 1234567890
    siblings = []
    for i in range(levels):
        # Use mock_hash to simulate Merkle tree hash at each level
        leaf_value = mock_hash(leaf_value, i)
        siblings.append(leaf_value)
    # The last leaf_value will be the Merkle root
    return leaf_value, siblings

# Example input values
nLevels = 20
historySize = 20
identityNullifier = 123456789012345678901234567890
identityTrapdoor = 987654321098765432109876543210
auctionIndex = 1
balanceIndex = 1
auctionId = 999
balance = 100000
bid = 5000
nonce = 123

# Generate dummy Merkle tree data
auctionRoot, auctionTreeSiblings = generate_merkle_data(nLevels)
balanceRoot, balanceTreeSiblings = generate_merkle_data(nLevels)
auctionRoots = [auctionRoot] * historySize  # Assume all auction roots are the same for simplicity

# Construct the input JSON
input_data = {
    "identityNullifier": identityNullifier,
    "identityTrapdoor": identityTrapdoor,
    "auctionIndex": auctionIndex,
    "auctionTreeSiblings": auctionTreeSiblings,
    "balanceTreeSiblings": balanceTreeSiblings,
    "auctionId": auctionId,
    "balance": balance,
    "bid": bid,
    "nonce": nonce,
    "auctionRoots": auctionRoots,
    "balanceRoot": balanceRoot,
    "balanceIndex": balanceIndex
}

# Save the input data to a JSON file
input_json_path = './input.json'
with open(input_json_path, 'w') as f:
    json.dump(input_data, f, indent=4)


