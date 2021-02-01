import Kitty from 0xKitty
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address, id: UInt64): &Kitty.NFT {
    let acct = getAccount(account)
    let collectionRef = acct.getCapability(Kitty.CollectionPublicPath).borrow<&{Kitty.KittyCollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    let kitten = collectionRef.borrowKitty(id: id)
    return kitten
}
 