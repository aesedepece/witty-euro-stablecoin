// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Import the ERC20 library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WittyEuro2 is ERC20 {

    constructor() ERC20("Witty Euro", "WEUR") {
    }

}
