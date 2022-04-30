export type NftVault = {
  "version": "0.1.0",
  "name": "nft_vault",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakeNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakeNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "release",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "nftVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalNftStakes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stakeNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "staker",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "KeyMismatch",
      "msg": "Keys should be equal"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6002,
      "name": "MintMismatch",
      "msg": "Mint should be equal"
    },
    {
      "code": 6003,
      "name": "AccountMismatch",
      "msg": "Authority should be equal"
    }
  ]
};

export const IDL: NftVault = {
  "version": "0.1.0",
  "name": "nft_vault",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakeNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakeNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "release",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeNft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "nftVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalNftStakes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stakeNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "staker",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "KeyMismatch",
      "msg": "Keys should be equal"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6002,
      "name": "MintMismatch",
      "msg": "Mint should be equal"
    },
    {
      "code": 6003,
      "name": "AccountMismatch",
      "msg": "Authority should be equal"
    }
  ]
};
