// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PromorangToken.sol";

/**
 * @title PromorangLiquidityVault
 * @notice Uniswap-style liquidity vault enabling brands/investors to deposit capital
 * while auto-distributing yield from promo redemptions and engagement micro-fees.
 */
contract PromorangLiquidityVault is ERC4626, AccessControl, ReentrancyGuard {
    bytes32 public constant CAMPAIGN_MANAGER_ROLE = keccak256("CAMPAIGN_MANAGER_ROLE");

    PromorangToken public immutable promoToken;
    address public treasury;

    // Fee Configuration (BPS: 100 = 1%)
    uint256 public lpFeeBps = 8000;       // 80% to Liquidity Providers
    uint256 public treasuryFeeBps = 1500; // 15% to Protocol Treasury
    uint256 public burnFeeBps = 500;      // 5% Burned ($PROMO)

    event RedemptionExecuted(
        bytes32 indexed campaignId,
        address indexed user,
        uint256 payoutAmount,
        uint256 lpYieldAmount
    );
    event FeesUpdated(uint256 lpFee, uint256 treasuryFee, uint256 burnFee);

    constructor(
        IERC20 asset_,
        PromorangToken promoToken_,
        address treasury_,
        address admin_
    ) 
        ERC4626(asset_) 
        ERC20("Promorang Vault LP", "pVAULT") 
    {
        promoToken = promoToken_;
        treasury = treasury_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(CAMPAIGN_MANAGER_ROLE, admin_);
    }

    /**
     * @notice Executed by Promorang Paymaster / Campaign Manager when a user redeems a promo.
     * Payouts user reward and distributes LP fee yield back into vault reserves.
     */
    function executeRedemptionWithFee(
        bytes32 campaignId,
        address user,
        uint256 totalPoolFee,
        uint256 rewardPayout
    ) external onlyRole(CAMPAIGN_MANAGER_ROLE) nonReentrant {
        IERC20 underlyingAsset = IERC20(asset());
        
        // 1. Transfer reward to the end user
        require(underlyingAsset.transfer(user, rewardPayout), "Reward transfer failed");

        // 2. Fee splits from the campaign pool fee
        uint256 treasuryShare = (totalPoolFee * treasuryFeeBps) / 10000;
        uint256 burnShare = (totalPoolFee * burnFeeBps) / 10000;
        uint256 lpYieldShare = totalPoolFee - treasuryShare - burnShare;

        // Treasury transfer
        require(underlyingAsset.transfer(treasury, treasuryShare), "Treasury fee failed");

        // Mint $PROMO cashback reward bonus to the user
        promoToken.mint(user, rewardPayout / 10);

        emit RedemptionExecuted(campaignId, user, rewardPayout, lpYieldShare);
    }
}
