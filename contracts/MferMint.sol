// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MferMint is ERC721, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address payable;

    IERC20 public immutable usdc;
    uint256 public priceUSDC; // USDC amount in smallest units (6 decimals)
    address public relayer;
    address public gallery;
    uint256 private _nextId = 1;

    // Fixed mint price in wei (0.0003 ETH)
    uint256 public constant MINT_PRICE = 300000000000000; // 0.0003 ether
    // Split amounts in wei
    uint256 public constant PAYEE1_AMOUNT = 170000000000000; // 0.00017
    uint256 public constant PAYEE2_AMOUNT = 130000000000000; // 0.00013

    // recipients for split (can be set by owner)
    address payable public payee1;
    address payable public payee2;

    mapping(string => bool) public processedPayment;

    event RelayerSet(address indexed relayer);
    event GallerySet(address indexed gallery);
    event PriceUSDCSet(uint256 price);
    event MintedFor(address indexed to, uint256 tokenId, string paymentId);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer");
        _;
    }

    constructor(address _usdc, uint256 _priceUSDC) ERC721("Mfer", "MFER") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        priceUSDC = _priceUSDC;
    }

    function setPayees(address _p1, address _p2) external onlyOwner {
        require(_p1 != address(0) && _p2 != address(0), "invalid payees");
        payee1 = payable(_p1);
        payee2 = payable(_p2);
    }

    // OWNER FUNCTIONS
    function setRelayer(address _r) external onlyOwner {
        require(_r != address(0), "invalid relayer");
        relayer = _r;
        emit RelayerSet(_r);
    }

    function setPriceUSDC(uint256 _price) external onlyOwner {
        priceUSDC = _price;
        emit PriceUSDCSet(_price);
    }

    function setGallery(address _g) external onlyOwner {
        require(_g != address(0), "invalid gallery");
        gallery = _g;
        emit GallerySet(_g);
    }

    // Keep your existing ETH payable mint if you want:
    function mint() external payable nonReentrant {
        // Enforce fixed mint price
        require(msg.value == MINT_PRICE, "Price mismatch");
        require(payee1 != address(0) && payee2 != address(0), "Payees not set");

        uint256 id = _nextId++;
        _safeMint(msg.sender, id);

        // split and forward funds
        payee1.sendValue(PAYEE1_AMOUNT);
        payee2.sendValue(PAYEE2_AMOUNT);
    }

    // Called by the relayer after it detects a successful Base Pay payment to this contract.
    // `paymentId` is an id returned by Base Pay (keeps replay protection)
    modifier onlyRelayerOrGallery() {
        require(msg.sender == relayer || msg.sender == gallery, "Only relayer or gallery");
        _;
    }

    function mintFor(address to, string calldata paymentId) external onlyRelayerOrGallery nonReentrant {
        require(!processedPayment[paymentId], "Payment already processed");
        require(usdc.balanceOf(address(this)) >= priceUSDC, "Insufficient USDC on contract");

        // mark processed BEFORE minting to avoid reentrancy issues
        processedPayment[paymentId] = true;

        uint256 id = _nextId++;
        _safeMint(to, id);

        emit MintedFor(to, id, paymentId);
    }

    // Relayer/ gallery may forward ETH directly and call this function
    function mintForWithEth(address to, string calldata paymentId) external payable onlyRelayerOrGallery nonReentrant {
        require(!processedPayment[paymentId], "Payment already processed");
        require(msg.value == MINT_PRICE, "Price mismatch");
        require(payee1 != address(0) && payee2 != address(0), "Payees not set");

        // mark processed BEFORE minting to avoid reentrancy
        processedPayment[paymentId] = true;

        uint256 id = _nextId++;
        _safeMint(to, id);

        // split and forward funds
        payee1.sendValue(PAYEE1_AMOUNT);
        payee2.sendValue(PAYEE2_AMOUNT);

        emit MintedFor(to, id, paymentId);
    }

    // Called by Gallery which forwards only the artist share (PAYEE1_AMOUNT).
    // The Gallery retains the other share (PAYEE2_AMOUNT) in its balance.
    function mintForWithEthFromGallery(address to, string calldata paymentId) external payable onlyRelayerOrGallery nonReentrant {
        require(!processedPayment[paymentId], "Payment already processed");
        require(msg.value == PAYEE1_AMOUNT, "Artist share mismatch");
        require(payee1 != address(0), "Payee1 not set");

        // mark processed BEFORE minting to avoid reentrancy
        processedPayment[paymentId] = true;

        uint256 id = _nextId++;
        _safeMint(to, id);

        // forward the received artist share to payee1
        payee1.sendValue(msg.value);

        emit MintedFor(to, id, paymentId);
    }

    // Allow owner to withdraw accumulated USDC
    function withdrawUSDC(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "invalid to");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC");
        usdc.safeTransfer(to, amount);
    }
}
