import Tuna from 0xTuna
import FungibleToken from 0xFungibleToken

transaction(recipient: Address, amount: UFix64) {
    let minter: &Tuna.Minter

    prepare(acct: AuthAccount) {
      self.minter = acct
        .borrow<&Tuna.Minter>(from: Tuna.AdminStoragePath)
        ?? panic("Could not borrow FT minter")
    }

    execute {
      let rec = getAccount(recipient)

      let receiver = rec
        .getCapability(Tuna.ReceiverPublicPath)!
        .borrow<&{FungibleToken.Receiver}>()
        ?? panic("Could not get FT receiver")

      let vault <- self.minter.mintTokens(amount: amount)
      receiver.deposit(from: <-vault)
    }
}
 