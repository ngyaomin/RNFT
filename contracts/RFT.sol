// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract RFT is ERC20 {
  uint public safetyPinAssetPrice;
  uint public safetyPinAssetSupply;
  uint public safetyPinEnd; // end of asset time, i have no idea how to name this

  uint public nftId;
  IERC721 public nft;
  IERC20 public dai;

  address public manager;

  constructor(
    string memory _name,
    string memory _symbol,
    address _nftAddress,
    uint _nftId,
    uint _safetyPinAssetPrice,
    uint _safetyPinAssetSupply,
    address _daiAddress
  )

  ERC20(_name, _symbol) {
    nftId = _nftId;
    nft = IERC721(_nftAddress);
    safetyPinAssetPrice = _safetyPinAssetPrice;
    safetyPinAssetSupply = _safetyPinAssetSupply;
    dai = IERC20(_daiAddress);
    manager = msg.sender;
  }

  function safetyPinStart() external {
    require(msg.sender == manager, 'fuck u only manager only');
    nft.transferFrom(msg.sender, address(this), nftId);
    safetyPinEnd = block.timestamp +  7 * 86400; // 7 weeks
  }

  function buySafetyPinAsset(uint safetyPinAssetAmount) external {
    require(safetyPinEnd > 0, 'Not start yet');
    require(block.timestamp <= safetyPinEnd, 'too late');
    require(totalSupply() + safetyPinAssetAmount <= safetyPinAssetSupply, 'no stock');
    uint daiAmount = safetyPinAssetAmount * safetyPinAssetPrice;
    dai.transferFrom(msg.sender,  address(this), daiAmount);
    _mint(msg.sender, safetyPinAssetAmount);
  }

  function withdrawSafetyPinProfits() external {
    require(msg.sender == manager, 'only manager pls');
    require(block.timestamp > safetyPinEnd, 'dude still early');
    uint daiBalance = dai.balanceOf(address(this));
    if(daiBalance > 0) {
      dai.transfer(manager, daiBalance);
    }
    uint unsoldSafetyPinAssetBalance = safetyPinAssetSupply - totalSupply();
    if(unsoldSafetyPinAssetBalance > 0) {
      _mint(manager, unsoldSafetyPinAssetBalance);
    }
  }
}
