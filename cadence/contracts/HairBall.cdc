import FungibleToken from 0xe03daebed8ca0615

pub contract HairBall: FungibleToken {

  pub var totalSupply: UFix64

  pub let VaultStoragePath: Path
  pub let ReceiverPublicPath: Path
  pub let BalancePublicPath: Path
  pub let AdminStoragePath: Path

  /// TokensInitialized
  ///
  /// The event that is emitted when the contract is created
  ///
  pub event TokensInitialized(initialSupply: UFix64)

  /// TokensWithdrawn
  ///
  /// The event that is emitted when tokens are withdrawn from a Vault
  ///
  pub event TokensWithdrawn(amount: UFix64, from: Address?)

  /// TokensDeposited
  ///
  /// The event that is emitted when tokens are deposited into a Vault
  ///
  pub event TokensDeposited(amount: UFix64, to: Address?)

  /// TokensMited
  /// 
  /// The event that is emitted when new fresh fresh tokens are minted
  ///
  pub event TokensMinted() 


  init() {
    self.totalSupply = 0.0

    self.VaultStoragePath = /storage/HairBall
    self.AdminStoragePath = /storage/Admin
    self.BalancePublicPath = /public/Balance
    self.ReceiverPublicPath = /public/Receiver
  }

  pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {
    
    /// The total balance of a vault
    pub var balance: UFix64

    init(balance: UFix64) {
      self.balance = balance
    }

    pub fun deposit(from: @FungibleToken.Vault) {
      self.balance = self.balance + from.balance
      destroy from
    }

    pub fun withdraw(amount: UFix64): @Vault {
      self.balance = self.balance - amount

      emit HairBall.TokensWithdrawn(amount: amount, from: self.owner?.address)
      return <- create Vault(balance: amount)
    }

  }

  pub fun createEmptyVault(): @Vault {
    return <- create Vault(balance: 0.0)
  }

  pub resource Minter {
    pub let mintLimit: UFix64

    init(mintLimit: UFix64) {
      self.mintLimit = mintLimit
    }

    pub fun mintTokens(amount: UFix64): @HairBall.Vault {
      HairBall.totalSupply = HairBall.totalSupply + amount
      return <- create Vault(balance: amount)
    }
  }

}
 