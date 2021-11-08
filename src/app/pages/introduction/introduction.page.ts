import { Component } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

import * as provotumAirGap from 'provotum-wasm-lib'
import * as sapling from '@airgap/sapling-wasm'
import * as BN from 'bn.js'
import * as crypto from 'crypto'

declare let cordova: any

@Component({
  selector: 'airgap-introduction',
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss']
})
export class IntroductionPage {
  public security: string = 'highest'

  constructor(
    private readonly modalController: ModalController,
    private readonly platform: Platform,
    private readonly storageService: VaultStorageService
  ) {}

  async initSapling() {
    await sapling.initParameters('12348129384729384', '81273942834798')
  }
  async initProvotum() {
    console.log('HARI')
    await provotumAirGap.initLib()
    console.log('BOL')

    const secretKey = '1000008'
    const [q, params, sk, pk] = await provotumAirGap.setupElgamal(secretKey)

    const rawByteSize = Buffer.byteLength(q.toString(), 'utf8')
    const byteSize = new BN(rawByteSize, 10)
    const targetValue: BN = new BN(q, 16)

    const r = this.getSecureRandomValue(targetValue, byteSize)

    console.log('HARIBOL', r.toString())
    const keygen = await provotumAirGap.keygen(r.toString(), params, sk, pk)
    console.log('KEGEN', keygen)
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

  public accept() {
    this.initProvotum()

    this.storageService
      .set(VaultStorageKey.INTRODUCTION_INITIAL, true)
      .then(() => {
        this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      })
      .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
  }

  public downloadClient() {
    this.openUrl('https://github.com/airgap-it')
  }

  public downloadApp() {
    // This should open App Store and not InAppBrowser
    if (this.platform.is('android')) {
      window.open('https://play.google.com/store/apps/details?id=it.airgap.wallet')
    } else if (this.platform.is('ios')) {
      window.open('itms-apps://itunes.apple.com/app/id1420996542') // AirGap Wallet
    }
  }

  private openUrl(url: string) {
    if (this.platform.is('ios') || this.platform.is('android')) {
      cordova.InAppBrowser.open(url, '_system', 'location=true')
    } else {
      window.open(url, '_blank')
    }
  }
}
