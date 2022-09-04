const { expect, assert } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random NFT unit test", async () => {
          let randomNFT
          let deployer
          let VRFCoordinatorV2Mock
          beforeEach(async () => {
              accounts = await ethers.getSigners() // On local network will get 10 fake accounts
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "randomipfs"])
              randomNFT = await ethers.getContract("RandomIPFSNFT")
              VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
          })
          describe("Constructor", async () => {
              it("Should set start variables correctly", async () => {
                  const dogTokenUriZero = await randomNFT.getDogTokenUris(0)
                  assert(dogTokenUriZero.includes("ipfs://"))
              })
          })
          describe("Request NFT", async () => {
              it("Fails if not enough ETH was sent", async () => {
                  await expect(randomNFT.requestNFT()).to.be.revertedWith(
                      "RandomIPFSNFT_NeedMoreEthSent"
                  )
              })
              it("Should emit the event and give random word request", async () => {
                  const fee = await randomNFT.getMintFee()
                  await expect(randomNFT.requestNFT({ value: fee.toString() })).to.emit(
                      randomNFT,
                      "NftRequested"
                  )
              })
          })
          describe("FullFillRandomWords", () => {
              it("Should mint after the number was returned", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomNFT.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomNFT.getDogTokenUris(0)
                              const tokenCounter = await randomNFT.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomNFT.getMintFee()
                          const requestNFTResponse = await randomNFT.requestNFT({
                              value: fee.toString(),
                          })
                          const requestNFTReceipt = await requestNFTResponse.wait(1)
                          await VRFCoordinatorV2Mock.fulfillRandomWords(
                              requestNFTReceipt.events[1].args.requestId,
                              randomNFT.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
      })
