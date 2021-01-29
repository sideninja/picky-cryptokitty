import HairBall from 0xHairball
import FungibleToken from 0xFungibleToken

transaction(recipient: Address, amount: UFix64) {
    let minter: &HairBall.Minter

    prepare(acct: AuthAccount) {
      self.minter = acct
        .borrow<&HairBall.Minter>(from: HairBall.AdminStoragePath)
        ?? panic("Could not borrow FT minter")
    }

    execute {
      let rec = getAccount(recipient)

      let receiver = rec
        .getCapability(HairBall.ReceiverPublicPath)!
        .borrow<&{FungibleToken.Receiver}>()
        ?? panic("Could not get FT receiver")

      let vault <- self.minter.mintTokens(amount: amount)
      receiver.deposit(from: <-vault)
    }
}
 