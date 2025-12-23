// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMferMint {
    function mintFor(address to, string calldata paymentId) external;
    function mintForWithEthFromGallery(address to, string calldata paymentId) external payable;
}

contract Gallery is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    // pending withdrawals (pull payments) for ETH credits (artist or other recipients)
    mapping(address => uint256) public pendingWithdrawals;

    IERC20 public immutable usdc;
    address public relayer;
    address public feeRecipient;
    uint256 public feeBps; // parts per 10k

    mapping(string => bool) public processedPayment;

    event RelayerSet(address indexed relayer);
    event FeeUpdated(address indexed recipient, uint256 bps);
    event Processed(address indexed artistContract, address indexed to, uint256 amount, string paymentId);
    event WithdrawnUSDC(address indexed to, uint256 amount);
    event WithdrawnETH(address indexed to, uint256 amount);

    // Fixed mint price in wei (0.0003 ETH)
    uint256 public constant MINT_PRICE = 300000000000000; // 0.0003 ether
    // Split amounts in wei
    uint256 public constant PAYEE1_AMOUNT = 170000000000000; // 0.00017
    uint256 public constant PAYEE2_AMOUNT = 130000000000000; // 0.00013

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer");
        _;
    }

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        feeRecipient = address(0);
        feeBps = 0;
    }

    function setRelayer(address _r) external onlyOwner {
        require(_r != address(0), "zero relayer");
        relayer = _r;
        emit RelayerSet(_r);
    }

    function setFee(address _recipient, uint256 _bps) external onlyOwner {
        require(_bps <= 10000, "bps to large");
        require(_recipient != address(0) || _bps == 0, "invalid fee recipient");
        feeRecipient = _recipient;
        feeBps = _bps;
        emit FeeUpdated(_recipient, _bps);
    }

    // Called by relayer to process a payment that resulted in USDC being sent to this Gallery contract.
    // The relayer should ensure `amount` has been received by this contract before calling.
    function processPayment(address artistContract, address to, uint256 amount, string calldata paymentId) external onlyRelayer nonReentrant {
        require(!processedPayment[paymentId], "Payment already processed");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC in gallery");

        processedPayment[paymentId] = true;

        uint256 fee = 0;
        if (feeBps > 0 && feeRecipient != address(0)) {
            fee = (amount * feeBps) / 10000;
            if (fee > 0) {
                usdc.safeTransfer(feeRecipient, fee);
            }
        }

        uint256 net = amount - fee;

        // forward net to artist contract (so the artist contract can validate balance and mint)
        usdc.safeTransfer(artistContract, net);

        // call artist contract's mintFor
        IMferMint(artistContract).mintFor(to, paymentId);

        emit Processed(artistContract, to, amount, paymentId);
    }

    // Simplified ETH flow: external payer sends full MINT_PRICE to Gallery.
    // Gallery retains PAYEE2_AMOUNT and forwards PAYEE1_AMOUNT to the artist contract,
    // calling `mintForWithEthFromGallery` on the artist contract so the artist contract
    // can mint and record the paymentId.
    function payAndMint(address artistContract, address to, string calldata paymentId) external payable nonReentrant {
        require(msg.value == MINT_PRICE, "Price mismatch");

        // Try to forward artist share to artist contract and trigger mint.
        // If the external call fails, credit the artist contract in `pendingWithdrawals`
        // so funds can be pulled instead of blocking the whole flow.
        try IMferMint(artistContract).mintForWithEthFromGallery{value: PAYEE1_AMOUNT}(to, paymentId) {
            // success
        } catch {
            // credit artistContract so it can withdraw later
            pendingWithdrawals[artistContract] += PAYEE1_AMOUNT;
        }

        // Gallery retains PAYEE2_AMOUNT in contract balance (or can be withdrawn by owner)
        emit Processed(artistContract, to, msg.value, paymentId);
    }

    // Owner withdraw leftover USDC
    function withdrawUSDC(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "invalid to");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC");
        usdc.safeTransfer(to, amount);
        emit WithdrawnUSDC(to, amount);
    }

    // Pull-based withdrawal for ETH credits
    function withdrawPending() external nonReentrant {
        uint256 amt = pendingWithdrawals[msg.sender];
        require(amt > 0, "no funds");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).sendValue(amt);
        emit WithdrawnETH(msg.sender, amt);
    }
}
