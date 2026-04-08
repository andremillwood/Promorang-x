const { MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');

/**
 * Service for handling Immutable Moment Records
 */
class RecordService {

    /**
     * Generate a Merkle Tree and Proof for a set of redemptions
     * @param {Array} redemptions - List of redemption objects { user_id, entitlement_id, redeemed_at }
     * @param {Object} metadata - Moment metadata { moment_id, organizer_id, closed_at }
     * @returns {Object} { root, leaves, proofData }
     */
    static generateRecord(redemptions, metadata) {
        if (!redemptions || redemptions.length === 0) {
            // Empty tree for no attendees
            return {
                root: SHA256('EMPTY').toString(),
                leaves: [],
                count: 0
            };
        }

        // 1. Create Leaves: Deterministic Hash of each participation
        // Format: SHA256(user_id + entitlement_id + redeemed_at_timestamp)
        const leaves = redemptions.map(r => {
            const data = `${r.user_id}:${r.entitlement_id}:${new Date(r.redeemed_at).getTime()}`;
            return SHA256(data);
        });

        // 2. Create Tree
        const tree = new MerkleTree(leaves, SHA256);
        const root = tree.getRoot().toString('hex');

        // 3. Generate individual proofs (optional, can be generated on-demand if leaves are stored)
        // For storage efficiency, we store the leaves and the root. 
        // We can verify a user later by reconstructing the tree.

        return {
            root,
            count: redemptions.length,
            metadata: {
                ...metadata,
                algorithm: 'sha256',
                tree_depth: tree.getDepth()
            },
            // We store the raw leaf data needed to reconstruct the tree
            // In a real blockchain scenario, we'd only store the root on-chain.
            // Here, we store the input data in the JSON artifact so anyone can re-verify.
            participants: redemptions.map(r => ({
                user_id: r.user_id,
                entitlement_id: r.entitlement_id,
                redeemed_at: r.redeemed_at,
                // We don't store the leaf hash directly, as it can be derived
            }))
        };
    }

    /**
     * Verify if a specific redemption is part of the record
     * @param {Object} redemption - The redemption to verify
     * @param {Object} recordData - The stored JSONB record data
     * @param {String} storedRootHash - The root hash stored in the DB (for double check)
     */
    static verifyParticipation(redemption, recordData, storedRootHash) {
        // 1. Reconstruct Leaves
        const leaves = recordData.participants.map(r => {
            const data = `${r.user_id}:${r.entitlement_id}:${new Date(r.redeemed_at).getTime()}`;
            return SHA256(data);
        });

        // 2. Reconstruct Tree
        const tree = new MerkleTree(leaves, SHA256);
        const derivedRoot = tree.getRoot().toString('hex');

        // 3. check Integrity
        if (derivedRoot !== storedRootHash) {
            console.error(`Root mismatch! Stored: ${storedRootHash}, Derived: ${derivedRoot}`);
            return false;
        }

        // 4. Verify specific leaf
        const leafData = `${redemption.user_id}:${redemption.entitlement_id}:${new Date(redemption.redeemed_at).getTime()}`;
        const leaf = SHA256(leafData);
        const proof = tree.getProof(leaf);

        return tree.verify(proof, leaf, derivedRoot);
    }
}

module.exports = RecordService;
