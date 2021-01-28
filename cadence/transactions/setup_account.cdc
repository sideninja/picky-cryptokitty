import Kitty from 0x120e725050340cab
import NonFungibleToken from 0x045a1763c93006ca

transaction {
    prepare(acct: AuthAccount) {

        // If the account doesn't already have a collection
        if acct.borrow<&Kitty.Collection>(from: Kitty.CollectionStoragePath) == nil {

            // Create a new empty collection
            let collection <- Kitty.createEmptyCollection()
            
            // save it to the account
            acct.save(<-collection, to: Kitty.CollectionStoragePath)

            // create a public capability for the collection
            acct.link<&Kitty.Collection{NonFungibleToken.CollectionPublic /*, Kitty.KittyItemsCollectionPublic*/}>(Kitty.CollectionPublicPath, target: Kitty.CollectionStoragePath)
        }
    }
}
