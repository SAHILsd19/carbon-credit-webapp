// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditToken is ERC721URIStorage, Ownable {
    struct CarbonCredit {
        uint256 totalTons;      // total certified tons
        uint256 availableTons;  // remaining tons available for sale
        uint256 pricePerTon;    // static vendor price
        uint256 expiryDate;     // UNIX timestamp
        string region;
        address issuer;         // vendor
        bool retired;
        bool burned;
    }

    uint256 public tokenCounter = 1;

    mapping(uint256 => CarbonCredit) public credits;
    mapping(uint256 => mapping(address => uint256)) public fractionalOwnedTons;

    event TokenMinted(uint256 tokenId, address issuer);
    event FractionBought(uint256 tokenId, address buyer, uint256 tons, uint256 price);
    event TokenRetired(uint256 tokenId, address owner, uint256 timestamp);
    event TokenBurned(uint256 tokenId, uint256 timestamp);

    constructor() ERC721("CarbonCredit", "CCT") Ownable(msg.sender) {}

    // Mint token (Algorithm-2 TokenizeCredits)
    function mintCredit(
        uint256 totalTons,
        uint256 pricePerTon,
        uint256 expiryDate,
        string memory region,
        string memory tokenURI
    ) external {
        uint256 tokenId = tokenCounter;
        tokenCounter++;

        credits[tokenId] = CarbonCredit({
            totalTons: totalTons,
            availableTons: totalTons,
            pricePerTon: pricePerTon,
            expiryDate: expiryDate,
            region: region,
            issuer: msg.sender,
            retired: false,
            burned: false
        });

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit TokenMinted(tokenId, msg.sender);
    }

    // Fractional Buy
    function buyFractions(uint256 tokenId, uint256 tons) external payable {
    CarbonCredit storage c = credits[tokenId];

    address owner = ownerOf(tokenId);
    require(owner != address(0), "Token not found");
    require(!c.retired && !c.burned, "Token inactive");
    require(block.timestamp < c.expiryDate, "Credit expired");
    require(c.availableTons >= tons, "Insufficient credits");

    uint256 cost = c.pricePerTon * tons;
    require(msg.value == cost, "Incorrect payment");

    payable(c.issuer).transfer(msg.value);
    c.availableTons -= tons;
    fractionalOwnedTons[tokenId][msg.sender] += tons;

    emit FractionBought(tokenId, msg.sender, tons, cost);
}


    // Lifecycle — Retire (Algorithm-4)
    function retireCredit(uint256 tokenId) external {
        require(fractionalOwnedTons[tokenId][msg.sender] > 0, "Not an owner");

        CarbonCredit storage c = credits[tokenId];
        require(!c.retired && !c.burned, "Already inactive");

        c.retired = true;
        emit TokenRetired(tokenId, msg.sender, block.timestamp);
    }

    // Lifecycle — Burn (expiry or regulation) (Algorithm-4)
    function burnCredit(uint256 tokenId) external onlyOwner {
    CarbonCredit storage c = credits[tokenId];
    require(!c.burned && !c.retired, "Already inactive");
    require(block.timestamp > c.expiryDate, "Cannot burn - still valid");

    c.burned = true;
    emit TokenBurned(tokenId, block.timestamp);
}


    // Utility read functions
    function getCredit(uint256 tokenId) external view returns (CarbonCredit memory) {
        return credits[tokenId];
    }

    function ownedTons(uint256 tokenId, address user) external view returns (uint256) {
        return fractionalOwnedTons[tokenId][user];
    }
}
