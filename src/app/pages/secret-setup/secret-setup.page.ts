import { Component, OnInit } from '@angular/core'
import { first } from 'rxjs/operators'

import { MnemonicSecret } from '../../models/secret'
import { DeviceService } from '../../services/device/device.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-secret-setup',
  templateUrl: './secret-setup.page.html',
  styleUrls: ['./secret-setup.page.scss']
})
export class SecretSetupPage implements OnInit {
  public canGoBack: boolean = false

  public isAdvancedMode: boolean = false

  constructor(
    private readonly navigationService: NavigationService,
    private readonly secretsService: SecretsService,
    private readonly deviceService: DeviceService
  ) {}

  public ngOnInit(): void {
    this.secretsService
      .getSecretsObservable()
      .pipe(first())
      .subscribe((secrets: MnemonicSecret[]) => {
        if (secrets.length > 0) {
          this.canGoBack = true
        }
      })
  }

  public ionViewDidEnter(): void {
    this.deviceService.setSecureWindow()
  }

  public ionViewWillLeave(): void {
    this.deviceService.clearSecureWindow()
  }

  public async goToGenerate(): Promise<void> {
    this.navigationService.route('/secret-generate-coin-flip').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
