import Kitty from 0xKitty

transaction(account: Address, id: UInt64) {
    
    prepare(acct: AuthAccount) {}

    execute {
      let acc = getAccount(account)

      let collection = acc
        .getCapability(Kitty.CollectionPublicPath)!
        .borrow<&{Kitty.KittyCollectionPublic}>()
        ?? panic("Could not get receiver NFT Collection")

      collection.checkKitty(id: id)

      let kitty = collection.borrowKitty(id: id)
      
      log("energy")
      log(kitty.energy)
    }
}
 