// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import Witnet router that provides convenient access to price feeds
import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";

// Import the ERC20 library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WittyEuro8 is ERC20 {

    // The base (how many WEUR does 1 CELO buy)
    uint256 public base;

    IWitnetPriceRouter public immutable witnet;

    // Event emitted to announce a completed rebase
    event Rebased(uint256 newBase);

    modifier isBased() {
        require(base > 0, "WEUR: not based!");
        _;
    }

    constructor() ERC20("Witty Euro", "WEUR") {
        witnet = IWitnetPriceRouter(0x6f8A7E2bBc1eDb8782145cD1089251f6e2C738AE);
    }

    /**
    * @notice WEUR only has 2 decimals, just as the real EUR.
    */
    function decimals() public pure override returns (uint8) {
        return 2;
    }

    /**
     * @notice Override of `balanceOf` to transform between internal units (wei) and rebased units (cents of WEUR).
     **/
    function balanceOf(address account) public view override returns (uint256) {
        if (base == 0) {
            return 0;
        }

        return ERC20.balanceOf(account) / base / 1_000_000_000;
    }

    /**
     * @notice Override of `transfer` that uses rebased units (cents of WEUR) but actually transfers internal units (wei).
     **/
    function transfer(address recipient, uint256 amount) public override isBased returns (bool) {
        uint256 celoAmount = amount * base * 1_000_000_000;

        _transfer(msg.sender, recipient, celoAmount);

        return true;
    }

    /**
     * @notice Tries to read the CELO/EUR price from the public Witnet feed and performs the rebase.
     **/
    function rebase() public {
        (int256 price,,) = witnet.valueFor(bytes4(0x21a79821));
        base = uint256(price);

        emit Rebased(base);
    }

    /**
     * @notice Mint WEUR by locking CELO.
     * @dev The contract state will keep balances as internal units (wei).
     */
    function mint() public payable isBased {
        // Mint as many internal units as wei received.
        _mint(msg.sender, uint64(msg.value));
    }

    /**
    * @notice Burn WEUR and withdraw equivalent amount of internal units (wei).
     */
    function burn(uint64 weurAmount) public payable isBased {
        uint256 celoAmount = weurAmount * base * 1_000_000_000;

        // Burn according number of internal units
        _burn(msg.sender, celoAmount);

        payable(msg.sender).transfer(celoAmount);
    }

}
