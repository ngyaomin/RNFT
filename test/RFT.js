const { time } = require('@openzeppelin/test-helpers');
const RFT = artifacts.require('RFT.sol');
const NFT = artifacts.require('NFT.sol');
const DAI = artifacts.require('DAI.sol');

const DAI_AMOUNT = web3.utils.toWei('20000');
const SAFETYPINASSET_AMOUNT = web3.utils.toWei('20000');

contract('RFT', async addresses => {
  const [manager, liqudityProvider1, liqudityProvider2, liqudityProvider3, liqudityProvider4, liqudityProvider5, _] = addresses;

  it('should work', async () => {

    const dai = await DAI.new();
    const nft = await NFT.new('SafetyPin Asset NFT', 'NFT');
    await nft.mint(manager, 1);
    await Promise.all([
      dai.mint(liqudityProvider1, DAI_AMOUNT),
      dai.mint(liqudityProvider2, DAI_AMOUNT),
      dai.mint(liqudityProvider3, DAI_AMOUNT),
      dai.mint(liqudityProvider4, DAI_AMOUNT),
      dai.mint(liqudityProvider5, DAI_AMOUNT)
    ]);


    const rft = await RFT.new(
      'SafetyPin Asset NFT',
      'SPANFT',
      nft.address,
      1,
      1,
      web3.utils.toWei('100000'),
      dai.address
    );
    await nft.approve(rft.address, 1);
    await rft.safetyPinStart();

    await dai.approve(rft.address, DAI_AMOUNT, {from: liqudityProvider1});
    await rft.buySafetyPinAsset(SAFETYPINASSET_AMOUNT, {from: liqudityProvider1});
    await dai.approve(rft.address, DAI_AMOUNT, {from: liqudityProvider2});
    await rft.buySafetyPinAsset(SAFETYPINASSET_AMOUNT, {from: liqudityProvider2});
    await dai.approve(rft.address, DAI_AMOUNT, {from: liqudityProvider3});
    await rft.buySafetyPinAsset(SAFETYPINASSET_AMOUNT, {from: liqudityProvider3});
    await dai.approve(rft.address, DAI_AMOUNT, {from: liqudityProvider4});
    await rft.buySafetyPinAsset(SAFETYPINASSET_AMOUNT, {from: liqudityProvider4});
    await dai.approve(rft.address, DAI_AMOUNT, {from: liqudityProvider5});
    await rft.buySafetyPinAsset(SAFETYPINASSET_AMOUNT, {from: liqudityProvider5});


    await time.increase(7 * 86400 + 1);
    await rft.withdrawSafetyPinProfits();


    const balanceLiqudityProvider1 = await rft.balanceOf(liqudityProvider1);
    const balanceLiqudityProvider2 = await rft.balanceOf(liqudityProvider2);
    const balanceLiqudityProvider3 = await rft.balanceOf(liqudityProvider3);
    const balanceLiqudityProvider4 = await rft.balanceOf(liqudityProvider4);
    const balanceLiqudityProvider5 = await rft.balanceOf(liqudityProvider5);
    assert(balanceLiqudityProvider1.toString() === SAFETYPINASSET_AMOUNT);
    assert(balanceLiqudityProvider2.toString() === SAFETYPINASSET_AMOUNT);
    assert(balanceLiqudityProvider3.toString() === SAFETYPINASSET_AMOUNT);
    assert(balanceLiqudityProvider4.toString() === SAFETYPINASSET_AMOUNT);
    assert(balanceLiqudityProvider5.toString() === SAFETYPINASSET_AMOUNT);
    const balanceManagerDAI = await dai.balanceOf(manager);
    assert(balanceManagerDAI.toString() === web3.utils.toWei('100000'));
  });
});
