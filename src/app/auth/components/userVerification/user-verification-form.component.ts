import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationService, AppService } from '../../../shared';
import { APP_LOGO, ValidationMessages, LOGIN, CONTACT_INFO, FORGOT_PASSWORD } from '../../../shared/constants';
import { AuthService } from '../../services';
import { findRouteURL } from '../../../shared/utils';

@Component({
  selector: 'app-user-verification-form',
  templateUrl: './user-verification-form.component.html',
  styleUrls: ['./user-verification-form.component.scss'],
})
export class UserVerificationFormComponent implements OnInit {

  public appLogo = APP_LOGO;
  public resetPasswordForm: FormGroup;
  public errorMsg = '';
  public succesMsg = '';
  public messages = ValidationMessages;
  public isServerResonse = false;
  public ifAlreadyLoggedIn = false;
  constructor(
    private router: Router,
    private formbuilder: FormBuilder,
    private authService: AuthService,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.appService.loader('stop');
    this.activatedRoute.data.subscribe(
      ({ verification }) => {
        const { verificationKey, isEmail, isLoggedIn } = verification;

        this.ifAlreadyLoggedIn = isLoggedIn;
        if (!this.ifAlreadyLoggedIn) {
          this.checkVerificationLink(isEmail, verificationKey);
        }
      }
    );
  }

  checkVerificationLink(isEmailVerification, key) {
    this.appService.loader('start');
    const verification_key = key;
    this.authService
      .checkVerificationLink(verification_key, isEmailVerification)
      .subscribe((res) => {
        this.appService.loader('stop');
        this.isServerResonse = true;
        const messageKey = 'message';
        if (isEmailVerification) {
          const { [messageKey]: message } = res;
          this.authService.loginAfterEmailVerification(message);
        } else {
          this.redirectTo('forgot-password');
        }
      },
      (err) => {
        this.isServerResonse = true;
        this.ref.detectChanges();
        const { message } = err;
        this.errorMsg = message;
        this.appService.loader('stop');
        this.ref.detectChanges();
      });
  }

  redirectTo(routeName) {
    this.router.navigate([findRouteURL(routeName)]);
  }
}
