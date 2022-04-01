// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import the ERC20 library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WittyEuro5 is ERC20 {

    // The base (how many WEUR does 1 CELO buy)
    uint256 public base;

    modifier isBased() {
        require(base > 0, "WEUR: not based!");
        _;
    }

    constructor() ERC20("Witty Euro", "WEUR") {
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

}
