import { Component, OnInit, ViewChild } from '@angular/core'
import { IonContent } from '@ionic/angular'
import { MnemonicSecret } from 'src/app/models/secret'
import { CoinFlipService } from 'src/app/services/coin-flip/coin-flip.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import * as BN from 'bn.js'
import * as crypto from 'crypto'
import * as provotumAirGap from 'provotum-wasm-lib'

@Component({
  selector: 'airgap-secret-generate-coin-flip',
  templateUrl: './secret-generate-coin-flip.page.html',
  styleUrls: ['./secret-generate-coin-flip.page.scss']
})
export class SecretGenerateCoinFlipPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent

  public isValid: boolean = true

  public minLength: number = 256
  public maxLength: number = 256

  public error: string = ''

  private entropy: string = ''

  constructor(private readonly navigationService: NavigationService, private readonly coinFlipService: CoinFlipService) {}

  ngOnInit() {}

  async next() {
    const entropy = await this.coinFlipService.getEntropyFromInput(this.entropy)

    const secret: MnemonicSecret = new MnemonicSecret(entropy)
    this.initProvotum(entropy)

    this.navigationService.routeWithState('secret-rules', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async initProvotum(entropy: string) {
    console.log('ENTROPY', entropy)
    await provotumAirGap.initLib()

    const [q, params, sk, pk] = await provotumAirGap.setupElgamal(entropy)

    const rawByteSize = Buffer.byteLength(q.toString(), 'utf8')
    const byteSize = new BN(rawByteSize, 10)
    const targetValue: BN = new BN(q, 16)

    const r = this.getSecureRandomValue(targetValue, byteSize)

    console.log('HARIBOL', r.toString())
    const keygen = await provotumAirGap.keygen(r.toString(), params, sk, pk)
    console.log('KEYGEN', keygen)
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

  async updateEntropy(input: string) {
    this.entropy = input
    this.validateEntropy()
  }

  async validateEntropy() {
    if (this.entropy.length !== 256) {
      this.isValid = false
      this.error = ''
      return
    }
    try {
      this.isValid = await this.coinFlipService.validateInput(this.entropy)
    } catch (e) {
      this.isValid = false
      this.error = e
    }
  }

  scrollToBottom() {
    this.content.scrollToBottom(500)
  }
}
