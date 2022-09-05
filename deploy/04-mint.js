const { ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    //Basic NFT
    const basicNft = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNft.mintNFT()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    //Random NFT
    const randomIpfsNft = await ethers.getContract("RandomIPFSNFT", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000) //5 minutes
        randomIpfsNft.once("NftMinted", async function () {
            resolve()
        })
        const randomIpfsNftMintTx = await randomIpfsNft.requestNFT({ value: mintFee.toString() })
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    //Dynamic SVG NFT
    const highValue = ethers.utils.parseEther("1700")
    const dynamicSVGNFT = await ethers.getContract("DynamicSVGNFT", deployer)
    const dynamicSvgNftMintTx = await dynamicSVGNFT.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSVGNFT.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
