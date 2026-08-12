import { ethers } from "hardhat";
import { expect } from "chai";

describe("Promorang Web3 Liquidity Vault Suite", function () {
  let promoToken: any;
  let liquidityVault: any;
  let mockUsdc: any;
  let owner: any;
  let brandLP: any;
  let user: any;
  let treasury: any;

  beforeEach(async function () {
    [owner, brandLP, user, treasury] = await ethers.getSigners();

    // 1. Deploy Mock USDC ERC20
    const MockToken = await ethers.getContractFactory("PromorangToken");
    mockUsdc = await MockToken.deploy(owner.address, owner.address);

    // 2. Deploy $PROMO Token
    promoToken = await MockToken.deploy(owner.address, owner.address);

    // 3. Deploy Liquidity Vault (ERC-4626)
    const VaultFactory = await ethers.getContractFactory("PromorangLiquidityVault");
    liquidityVault = await VaultFactory.deploy(
      await mockUsdc.getAddress(),
      await promoToken.getAddress(),
      treasury.address,
      owner.address
    );

    // Grant MINTER_ROLE on $PROMO to Vault
    const MINTER_ROLE = await promoToken.MINTER_ROLE();
    await promoToken.grantRole(MINTER_ROLE, await liquidityVault.getAddress());

    // Transfer test funds to Brand LP
    await mockUsdc.transfer(brandLP.address, ethers.parseEther("10000"));
    await mockUsdc.connect(brandLP).approve(await liquidityVault.getAddress(), ethers.parseEther("10000"));
  });

  it("Should allow Brand LPs to deposit liquidity and receive pVAULT LP shares", async function () {
    const depositAmount = ethers.parseEther("1000");
    await liquidityVault.connect(brandLP).deposit(depositAmount, brandLP.address);

    const shares = await liquidityVault.balanceOf(brandLP.address);
    expect(shares).to.equal(depositAmount);
    expect(await liquidityVault.totalAssets()).to.equal(depositAmount);
  });

  it("Should execute promo redemption, pay user, distribute 80% fee split to LPs, 15% treasury, and 5% burn", async function () {
    // Brand deposits 5,000 USDC pool liquidity
    await liquidityVault.connect(brandLP).deposit(ethers.parseEther("5000"), brandLP.address);

    const campaignId = ethers.id("CAMPAIGN_001");
    const rewardPayout = ethers.parseEther("100");
    const poolFee = ethers.parseEther("10");

    // Execute redemption
    await liquidityVault.executeRedemptionWithFee(campaignId, user.address, poolFee, rewardPayout);

    // Verify User Payout
    expect(await mockUsdc.balanceOf(user.address)).to.equal(rewardPayout);

    // Verify Treasury Share (15% of 10 USDC = 1.5 USDC)
    expect(await mockUsdc.balanceOf(treasury.address)).to.equal(ethers.parseEther("1.5"));
  });
});
