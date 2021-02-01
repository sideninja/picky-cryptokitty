import FungibleToken from 0xFungibleToken
import Tuna from 0xTuna

transaction {
    prepare(acct: AuthAccount) {
        
        if acct.borrow<&Tuna.Vault>(from: Tuna.VaultStoragePath) == nil {
          // create ft vault
          acct.save(<- Tuna.createEmptyVault(), to: Tuna.VaultStoragePath)

          // link public vault receiver and balance interafaces
          acct.link<&Tuna.Vault{FungibleToken.Receiver, FungibleToken.Balance}>(Tuna.ReceiverPublicPath, target: Tuna.VaultStoragePath)
        }
    }
}
 