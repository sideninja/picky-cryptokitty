import NonFungibleToken from 0x045a1763c93006ca
import FungibleToken from 0xe03daebed8ca0615

// Kitty contract
pub contract Kitty: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64)
    pub event KittyFed()
    pub event KittyRefusedFood()

    // Named Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: Path
    pub let MinterStoragePath: StoragePath

    // totalSupply
    // The total number of KittyItems that have been minted
    pub var totalSupply: UInt64

    // initializer
	init() {
        self.CollectionStoragePath = /storage/KittyCollection
        self.CollectionPublicPath = /public/KittyCollection
        self.MinterStoragePath = /storage/KittyMinter

        // Initialize the total supply
        self.totalSupply = 0

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
	}

    pub resource PickyKitty: NonFungibleToken.INFT {
        // unique id of kitty
        pub let id: UInt64
        
        // energy consumption for the kitty energy units per minutes
        pub let energyConsumption: UFix64

        // max energy kitty has when it's completely fed
        pub let maxEnergy: UFix64
        
        // current energy level kitty has
        pub var energy: UFix64 // change to UInt8 with food type
        
        // track when the kitty was last fed
        pub var lastFed: UFix64
        

        init(id: UInt64) {
            self.id = id
            // make some default properties for the kitty, this could be upgraded to depend on the kitty genetics
            self.maxEnergy = 100.0
            self.energyConsumption = 5.0

            // when the kitty is born it is fully fed
            self.energy = self.maxEnergy
            self.lastFed = getCurrentBlock().timestamp
        }

        pub fun feedMe(food: @FungibleToken.Vault) {
            // make a random chance for food to be discarded cuz I'm a cat and FUUU
            // todo make logic based on tokens success but also change interface to food token
            // if food.chance > random() { destroy food }

            self.energy = self.energy + food.balance;

            // max out energy
            if self.energy > self.maxEnergy {
                self.energy = self.maxEnergy
            }

            destroy food;
        }

        pub fun updateEnergy() {

        }
    }   

    pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        // Dictionary to hold the NFTs in the Collection
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        destroy() {
            destroy self.ownedNFTs
        }

        // withdraw removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <- token
        }

        // deposit takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let id = token.id
            let old <- self.ownedNFTs[id] <-token
            destroy old

            emit Deposit(id: id, to: self.owner?.address)
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // Returns a borrowed reference to an NFT in the collection
        // so that the caller can read data and call methods from it
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as! &NonFungibleToken.NFT
        }
    }

    // Mint NFT Resources
    pub resource NFTMinter {
        
        // mint NFTs but in a "pseudorandom" manner 
        pub fun mint(recipient: &{NonFungibleToken.CollectionPublic}) {
            let uniqueId = Kitty.totalSupply % (10 as UInt64)

            emit Minted(id: uniqueId)
            recipient.deposit(token: <- create Kitty.NFT(id: uniqueId))

            Kitty.totalSupply = Kitty.totalSupply + (1 as UInt64)
        }
    }

    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    

}
 