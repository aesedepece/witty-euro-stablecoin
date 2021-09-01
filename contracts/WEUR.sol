// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;


// Import the UsingWitnet library that enables interacting with Witnet
import "witnet-ethereum-bridge/contracts/UsingWitnet.sol";

// Import the BitcoinPrice request that you created before
import "./requests/EthEurPrice6.sol";

// Import the ERC20 library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WEUR is UsingWitnet, ERC20 {

    // The Witnet data request that is used for rebasing.
    IWitnetRequest request;

    // The base (how many WEUR does 1 ETH buy)
    uint64 base;

    // Timestamp of the last rebase completion
    uint256 timestamp;

    // Whether we are in the middle of a rebase.
    bool public rebasing;

    // The ID of the last query sent to Witnet
    uint256 public witnetQueryId;

    // Event emitted to announce a rebase request
    event RebaseRequested();

    // Event emitted to announce a completed rebase
    event Rebased(uint64 newBase);

    // Event emmitted to announce a failed rebase
    event RebaseFailed(string errorMessage);

    modifier isRebasing() {
        require(rebasing, "WEUR: can't do this if not already rebasing");
        _;
    }

    modifier isNotRebasing() {
        require(!rebasing, "WEUR: complete pending rebase before doing this");
        _;
    }

    modifier isBased() {
        require(base > 0, "WEUR: not based!");
        _;
    }

    constructor (WitnetRequestBoard _wrb) UsingWitnet(_wrb) ERC20("Witty Euro", "WEUR") {
        request = new EthEurPrice6Request();
    }

    /**
     * @notice Requests a rebase by sending a Witnet data request that fetches the ETHEUR price.
     **/
    function requestRebase() public payable isNotRebasing {
        // Send the request to Witnet and store the ID for later retrieval of the result
        // The `_witnetPostRequest` method comes with `UsingWitnet`
        witnetQueryId = _witnetPostRequest(request);

        // Signal that there is already a pending request
        rebasing = true;

        // Announce the rebase request
        emit RebaseRequested();
    }

    /**
     * @notice Tries to read the result of the Witnet query and performs the rebase.
     **/
    function completeRebase() public isRebasing witnetRequestSolved(witnetQueryId) {
        // Read the result of the Witnet query
        Witnet.Result memory result = _witnetReadResult(witnetQueryId);

        // If the Witnet query succeeded, decode the result and update the base
        // If it failed, revert the transaction with a pretty-printed error message
        // `witnet.isOk()`, `witnet.asUint64()` and `witnet.asErrorMessage()` come with `UsingWitnet`
        if (witnet.isOk(result)) {
            base = witnet.asUint64(result);
            timestamp = block.timestamp;

            // Announce the rebase completion
            emit Rebased(base);
        } else {
            string memory errorMessage;

            // Try to read the value as an error message, catch error bytes if read fails
            try witnet.asErrorMessage(result) returns (Witnet.ErrorCodes, string memory e) {
                errorMessage = e;
            }
            catch (bytes memory errorBytes){
                errorMessage = string(errorBytes);
            }

            // Announce the rebase failure
            emit RebaseFailed(errorMessage);
        }

        // In any case, set `pending` to false so a new rebase can be requested
        rebasing = false;
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

        return ERC20.balanceOf(account) / base / 10_000;
    }

    /**
     * @notice Override of `transfer` that uses rebased units (cents of WEUR) but actually transfers internal units (wei).
     **/
    function transfer(address recipient, uint256 amount) public override isBased returns (bool) {
        uint256 ethAmount = amount * base * 10_000;

        _transfer(msg.sender, recipient, ethAmount);

        return true;
    }

    /**
     * @notice Mint WEUR by locking ETH.
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
        uint64 ethAmount = weurAmount * base * 10_000;

        // Burn aaccording number of internal units
        _burn(msg.sender, ethAmount);

        payable(msg.sender).transfer(ethAmount);
    }

}
