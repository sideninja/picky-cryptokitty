import Kitty from 0xKitty
import NonFungibleToken from 0xNonFungibleToken

transaction(recipient: Address) {
    let minter: &Kitty.NFTMinter

    prepare(acct: AuthAccount) {
      self.minter = acct
        .borrow<&Kitty.NFTMinter>(from: Kitty.MinterStoragePath)
        ?? panic("Could not borrow NFT Minter")
    }

    execute {
      let rec = getAccount(recipient)

      let receiver = rec
        .getCapability(Kitty.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not get receiver NFT Collection")

      self.minter.mint(recipient: receiver)
    }
}
 