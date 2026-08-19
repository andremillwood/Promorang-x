// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PromorangToken ($PROMO)
 * @notice Protocol utility token for liquidity rewards, promo cashback, and governance.
 */
contract PromorangToken is ERC20, ERC20Burnable, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public immutable MAX_SUPPLY = 100_000_000 * 10**18; // 100M tokens

    event TokensMinted(address indexed to, uint256 amount);

    constructor(address defaultAdmin, address minter) 
        ERC20("Promorang Token", "PROMO") 
        ERC20Permit("Promorang Token") 
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
        
        // Initial genesis mint: 10% for initial liquidity seeding
        _mint(defaultAdmin, 10_000_000 * 10**18);
    }

    /**
     * @notice Mint rewards for liquidity mining or cashback.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "PROMO: Max supply exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
