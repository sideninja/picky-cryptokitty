import Kitty from 0xKitty
import Tuna from 0xTuna

transaction(id: UInt64, amount: UFix64) {
    let vault: &Tuna.Vault
    let collection: &Kitty.Collection

    prepare(acct: AuthAccount) {
      self.vault = acct
        .borrow<&Tuna.Vault>(from: Tuna.VaultStoragePath)
        ?? panic("No vault for tuna")

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
 