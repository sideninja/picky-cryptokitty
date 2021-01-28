import Kitty from 0xKitty
import NonFungibleToken from 0xNonFungibleToken

transaction {
    prepare(acct: AuthAccount) {

        // If the account doesn't already have a collection
        if acct.borrow<&Kitty.Collection>(from: Kitty.CollectionStoragePath) == nil {

            // Create a new empty collection
            let collection <- Kitty.createEmptyCollection()
            
            // save it to the account
            acct.save(<-collection, to: Kitty.CollectionStoragePath)

            // create a public capability for the collection
            acct.link<&Kitty.Collection{NonFungibleToken.CollectionPublic, Kitty.KittyCollectionPublic}>(Kitty.CollectionPublicPath, target: Kitty.CollectionStoragePath)
        }
    }
}
 