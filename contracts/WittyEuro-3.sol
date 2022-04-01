// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import the ERC20 library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WittyEuro3 is ERC20 {

    constructor() ERC20("Witty Euro", "WEUR") {
    }

    /**
    * @notice WEUR only has 2 decimals, just as the real EUR.
    */
    function decimals() public pure override returns (uint8) {
        return 2;
    }

}
