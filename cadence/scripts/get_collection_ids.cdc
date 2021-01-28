import Kitty from 0xKitty
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address): [UInt64] {
    let acct = getAccount(account)
    let collectionRef = acct.getCapability(Kitty.CollectionPublicPath).borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs()
}
 