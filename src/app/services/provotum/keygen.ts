export interface Uint8KeyGenerationProof {
  challenge: number[]
  response: number[]
}

export interface Uint8PublicKeyShare {
  pk: number[]
  proof: Uint8KeyGenerationProof
}

export interface Uint8PublicKeyShare {
  pk: number[]
  proof: Uint8KeyGenerationProof
}

export interface Uint8PublicKeyShareSync extends Uint8PublicKeyShare {
  sealer: string
}
