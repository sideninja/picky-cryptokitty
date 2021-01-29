import Kitty from 0xKitty
import HairBall from 0xHairBall

transaction(id: UInt64, amount: UFix64) {
    let vault: &HairBall.Vault
    let collection: &Kitty.Collection

    prepare(acct: AuthAccount) {
      self.vault = acct
        .borrow<&HairBall.Vault>(from: HairBall.VaultStoragePath)
        ?? panic("No vault for hairball")

      self.collection = acct
        .borrow<&Kitty.Collection>(from: Kitty.CollectionStoragePath)
        ?? panic("No kitty collection")
    }

    execute {
      let foodVault <- self.vault.withdraw(amount: amount)

      let kitty = self.collection.borrowKitty(id: id)
      kitty.feedMe(food: <- foodVault)
    }
}
 