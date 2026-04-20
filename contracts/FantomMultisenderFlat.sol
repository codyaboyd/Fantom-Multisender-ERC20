// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FantomMultisenderFlat
 * @notice Flat (no-import) ERC-20 multisender contract that matches the frontend ABI.
 *
 * ABI function expected by the app:
 *   airdrop(address[] toAirdrop, uint256[] ethFromEach, uint256 totalEth, uint256 tokensRewarded, address tokenAddress)
 */
interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract FantomMultisenderFlat {
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
        require(length > 0, "no recipients");
        require(length == ethFromEach.length, "length mismatch");
        require(totalEth > 0, "totalEth is zero");
        require(tokensRewarded > 0, "tokensRewarded is zero");
        require(tokenAddress != address(0), "token is zero");

        IERC20Minimal token = IERC20Minimal(tokenAddress);

        uint256 runningWeight;
        uint256 distributed;

        for (uint256 i = 0; i < length; i++) {
            address recipient = toAirdrop[i];
            uint256 weight = ethFromEach[i];

            require(recipient != address(0), "recipient is zero");
            require(weight > 0, "weight is zero");

            runningWeight += weight;

            uint256 amount;
            if (i + 1 == length) {
                amount = tokensRewarded - distributed;
            } else {
                amount = (tokensRewarded * weight) / totalEth;
                distributed += amount;
            }

            if (amount > 0) {
                require(token.transferFrom(msg.sender, recipient, amount), "transferFrom failed");
            }
        }

        require(runningWeight == totalEth, "weight sum mismatch");

        emit AirdropExecuted(msg.sender, tokenAddress, length, totalEth, tokensRewarded);
    }
}
