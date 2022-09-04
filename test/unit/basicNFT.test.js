const { expect, assert } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT unit test", async () => {
          let basicNFT
          let deployer
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["basicnft"])
              basicNFT = await ethers.getContract("BasicNFT")
          })
          describe("Contructor", async () => {
              it("Create NFT correct", async () => {
                  const tokenCounter = await basicNFT.getTokenCounter()
                  const name = await basicNFT.name()
                  const symbol = await basicNFT.symbol()
                  assert.equal(tokenCounter, 0)
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
              })
          })
          describe("Mint NFT", async () => {
              it("Should mint NFT correct", async () => {
                  const txResponse = await basicNFT.mintNFT()
                  await txResponse.wait(1)
                  const tokenURI = await basicNFT.tokenURI(0)
                  const tokenCounter = await basicNFT.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, await basicNFT.TOKEN_URI())
              })
          })
      })
