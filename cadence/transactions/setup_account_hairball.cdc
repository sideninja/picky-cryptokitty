import FungibleToken from 0xFungibleToken
import HairBall from 0xHairBall

transaction {
    prepare(acct: AuthAccount) {
        
        if acct.borrow<&HairBall.Vault>(from: HairBall.VaultStoragePath) == nil {
          // create ft vault
          acct.save(<- HairBall.createEmptyVault(), to: HairBall.VaultStoragePath)

          // link public vault receiver and balance interafaces
          acct.link<&HairBall.Vault{FungibleToken.Receiver, FungibleToken.Balance}>(HairBall.ReceiverPublicPath, target: HairBall.VaultStoragePath)
        }
    }
}
 