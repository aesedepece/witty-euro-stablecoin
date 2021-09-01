const WEUR = artifacts.require("WEUR")
const WitnetProxy = artifacts.require("WitnetProxy")
const WitnetRequestBoard = artifacts.require("WitnetRequestBoard")

const { expectRevert } = require("@openzeppelin/test-helpers")

contract("WEUR", (accounts) => {
  let weur, wrb, witnetFee

  const alice = accounts[1]
  const bob = accounts[2]
  const charlie = accounts[3]

  const gasPrice = web3.utils.toWei("1", "gwei")

  describe("End-2-end", () => {
    before(async () => {
      weur = await WEUR.deployed()
      wrb = await WitnetRequestBoard.at(WitnetProxy.address)
      witnetFee = parseInt(await wrb.estimateReward(gasPrice))
    })

    it("shouldn't allow minting before basing", async () => {
      await expectRevert(
        weur.mint({
          from: charlie,
          value: web3.utils.toWei("1", "ether"),
        }),
        "WEUR: not based!"
      )
    })

    it("shouldn't allow burning before basing", async () => {
      await expectRevert(
        weur.burn(1000, {
          from: charlie,
          value: web3.utils.toWei("1", "ether"),
        }),
        "WEUR: not based!"
      )
    })

    it("shouldn't allow transferring before basing", async () => {
      await expectRevert(
        weur.transfer(alice, 1000, { from: charlie }),
        "WEUR: not based!"
      )
    })

    it("should calculate initial `balanceOf` as 0", async () => {
      assert(parseInt(await weur.balanceOf(charlie)) === 0, "initial balance is not 0")
    })

    it("shouldn't allow completing rebase before requesting rebase", async () => {
      await expectRevert(
        weur.completeRebase(),
        "WEUR: can't do this if not already rebasing"
      )
    })

    it("should allow requesting a rebase", async () => {
      await weur.requestRebase({
        from: charlie,
        value: witnetFee,
        gasPrice,
      })
      assert(await weur.rebasing(), "`rebasing` flag hasn't been set to `true`")
    })

    it("shouldn't allow requesting a rebase if already rebasing", async () => {
      await expectRevert(
        weur.requestRebase(),
        "WEUR: complete pending rebase before doing this"
      )
    })

    it("should allow completing a rebase after Witnet query is solved", async () => {
      await wrb.reportResult(1, "0x0000000000000000000000000000000000000000000000000000000000000001", "0x1A3B9ACA00")
      await weur.completeRebase({ from: charlie })
      assert(!await weur.rebasing(), "`rebasing` flag hasn't been set to `false`")
    })

    it("should allow minting once based", async () => {
      await weur.mint({
        from: alice,
        value: web3.utils.toWei("3", "ether"),
        gasPrice,
      })
    })

    it("should compute WEUR balance correctly", async () => {
      assert(parseInt(await weur.balanceOf(alice)) === 300000, "Alice's WEUR balance is not correct")
    })

    it("should recompute WEUR balance correctly upon rebasing", async () => {
      await weur.requestRebase({
        from: charlie,
        value: witnetFee,
        gasPrice,
      })
      await wrb.reportResult(2, "0x0000000000000000000000000000000000000000000000000000000000000002", "0x1A77359400")
      await weur.completeRebase({ from: charlie })
      assert(parseInt(await weur.balanceOf(alice)) === 150000, "Alice's WEUR balance is not correct")
    })

    it("shouldn't allow transferring without balance", async () => {
      await expectRevert(
        weur.transfer(alice, 1000, { from: charlie }),
        "ERC20: transfer amount exceeds balance"
      )
    })

    it("should transfer the right amount", async () => {
      await weur.transfer(bob, 50000, { from: alice })
      assert(parseInt(await weur.balanceOf(alice)) === 100000, "Alice's balance is not correct")
      assert(parseInt(await weur.balanceOf(bob)) === 50000, "Bob's balance is not correct")
    })
  })
})
