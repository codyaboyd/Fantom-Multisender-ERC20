// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FantomMultisenderFlat
 * @notice Flat (no-import) ERC-20 multisender contract that matches the frontend ABI.
 *
 * ABI function expected by the app:
 *   airdrop(address[] toAirdrop, uint256[] ethFromEach, uint256 totalEth, uint256 tokensRewarded, address tokenAddress)
 */
contract FantomMultisenderFlat {
    error NoRecipients();
    error LengthMismatch();
    error TotalWeightZero();
    error TotalTokensZero();
    error TokenZeroAddress();
    error RecipientZeroAddress();
    error WeightZero();
    error WeightSumMismatch();
    error TransferFromFailed();

    event AirdropExecuted(
        address indexed sender,
        address indexed token,
        uint256 recipients,
        uint256 totalWeight,
        uint256 totalTokens
    );

    /**
     * @notice Distributes `tokensRewarded` from msg.sender across `toAirdrop` using weight values in `ethFromEach`.
     * @dev `ethFromEach` and `totalEth` are treated as generic weight units (historical naming retained for ABI compatibility).
     */
    function airdrop(
        address[] calldata toAirdrop,
        uint256[] calldata ethFromEach,
        uint256 totalEth,
        uint256 tokensRewarded,
        address tokenAddress
    ) external {
        uint256 length = toAirdrop.length;
        if (length == 0) revert NoRecipients();
        if (length != ethFromEach.length) revert LengthMismatch();
        if (totalEth == 0) revert TotalWeightZero();
        if (tokensRewarded == 0) revert TotalTokensZero();
        if (tokenAddress == address(0)) revert TokenZeroAddress();

        address sender = msg.sender;
        uint256 runningWeight;
        uint256 distributed;

        for (uint256 i = 0; i < length; ) {
            address recipient = toAirdrop[i];
            uint256 weight = ethFromEach[i];

            if (recipient == address(0)) revert RecipientZeroAddress();
            if (weight == 0) revert WeightZero();

            runningWeight += weight;

            uint256 amount;
            if (i + 1 == length) {
                amount = tokensRewarded - distributed;
            } else {
                amount = (tokensRewarded * weight) / totalEth;
                distributed += amount;
            }

            if (amount > 0) _safeTransferFrom(tokenAddress, sender, recipient, amount);

            unchecked {
                ++i;
            }
        }

        if (runningWeight != totalEth) revert WeightSumMismatch();

        emit AirdropExecuted(sender, tokenAddress, length, totalEth, tokensRewarded);
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) private {
        bool success;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x23b872dd00000000000000000000000000000000000000000000000000000000)
            mstore(add(ptr, 0x04), from)
            mstore(add(ptr, 0x24), to)
            mstore(add(ptr, 0x44), amount)

            success := call(gas(), token, 0, ptr, 0x64, 0x00, 0x20)
            if success {
                switch returndatasize()
                case 0 {
                    success := 1
                }
                case 0x20 {
                    success := eq(mload(0x00), 1)
                }
                default {
                    success := 0
                }
            }
        }

        if (!success) revert TransferFromFailed();
    }
}
