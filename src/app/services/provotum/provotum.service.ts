import { IACMessageDefinitionObjectV3, MainProtocolSymbols, MessageSignResponse } from '@airgap/coinlib-core'
import { IACMessageType } from '@airgap/coinlib-core/serializer-v3/interfaces'
import { Injectable } from '@angular/core'
import * as BN from 'bn.js'
import * as crypto from 'crypto'
import * as provotumAirGap from 'provotum-wasm-lib'
import { Observable } from 'rxjs'
import { MnemonicSecret } from 'src/app/models/secret'
import { InteractionOperationType, InteractionService } from '../interaction/interaction.service'
import { SecretsService } from '../secrets/secrets.service'

// const signer: BIPSigner = new BIPSigner()

@Injectable({
  providedIn: 'root'
})
export class ProvotumService {
  public keygen: any // TODO JGD type
  public readonly currentSecret$: Observable<MnemonicSecret>

  constructor(private readonly secretsService: SecretsService, private readonly interactionService: InteractionService) {
    this.currentSecret$ = this.secretsService.getActiveSecretObservable()
  }

  async initProvotum(): Promise<void> {
    return new Promise((resolve) => {
      this.currentSecret$.subscribe(async (secret) => {
        const entropy: string = await this.secretsService.retrieveEntropyForSecret(secret)

        await provotumAirGap.initLib()
        const [q, params, sk, pk] = await provotumAirGap.setupElgamal(entropy)

        const rawByteSize = Buffer.byteLength(q.toString(), 'utf8')
        const byteSize = new BN(rawByteSize, 10)
        const targetValue: BN = new BN(q, 16)
        const r = this.getSecureRandomValue(targetValue, byteSize)
        this.keygen = await provotumAirGap.keygen(r.toString(), params, sk, pk)
        resolve()
      })
    })
  }

  sync() {
    const messageSignResponse: MessageSignResponse = {
      message: JSON.stringify(this.keygen),
      publicKey: '',
      signature: ''
    }

    const iacObject: IACMessageDefinitionObjectV3 = {
      id: 12345678,
      type: IACMessageType.MessageSignResponse,
      protocol: MainProtocolSymbols.XTZ,
      payload: messageSignResponse
    }

    this.interactionService.startInteraction({
      operationType: InteractionOperationType.MESSAGE_SIGN_REQUEST,
      iacMessage: [iacObject],
      messageSignResponse
    })
  }

  // get a secure random value x: 0 < x < n
  getSecureRandomValue = (n: BN, BYTE_SIZE: BN): BN => {
    let byteSize: number
    try {
      byteSize = BYTE_SIZE.toNumber()
    } catch {
      // https://www.ecma-international.org/ecma-262/5.1/#sec-8.5
      // used for large numbers from EC
      byteSize = 32
    }

    let randomBytes: Buffer = crypto.randomBytes(byteSize)
    let randomValue: BN = new BN(randomBytes)

    return randomValue.mod(n)
  }
}
