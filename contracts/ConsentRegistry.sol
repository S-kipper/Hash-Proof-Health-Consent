// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ConsentRegistry {
    uint256 public nextId;

    struct Consent {
        address signer;
        bytes signature;
        uint256 timestamp;
        bytes32 dataHash;
        string ipfsCid;
    }

    mapping(uint256 => Consent) public consents;
                           

    event ConsentRecorded(
        uint256 indexed id,
        address indexed signer,
        uint256 timestamp,
        bytes32 dataHash,
        string ipfsCid
    );

    function recordConsent(
        address signer,
        bytes calldata signature,
        bytes32 dataHash,
        string calldata ipfsCid
    ) external returns (uint256) {
        uint256 id = nextId++;
        consents[id] = Consent({
            signer: signer,
            signature: signature,
            timestamp: block.timestamp,
            dataHash: dataHash,
            ipfsCid: ipfsCid
        });

        emit ConsentRecorded(id, signer, block.timestamp, dataHash, ipfsCid);
        return id;
    }
}
