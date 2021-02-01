import Tuna from 0xTuna
import FungibleToken from 0xFungibleToken

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)
    let vault = acct.getCapability(Tuna.ReceiverPublicPath).borrow<&Tuna.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow capability from public collection")
    
    log(vault.balance)
    return vault.balance
}
 