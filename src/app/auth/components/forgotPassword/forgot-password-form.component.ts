import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService, AppService } from '../../../shared';
import { ValidationMessages, APP_LOGO, LOGIN } from '../../../shared/constants';
import { AuthService } from '../../services';

@Component({
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent implements OnInit {

  public appLogo = APP_LOGO;
  forgotPasswordForm: FormGroup;
  errorMsg= '';
  successMsg = '';
  messages = ValidationMessages;
  public is_email_verified = true;

  constructor(
    private router: Router,
    private formbuilder: FormBuilder,
    private authService: AuthService,
    private ref: ChangeDetectorRef,
    private appService: AppService
  ) {
    this.forgotPasswordForm = formbuilder.group({
      email: [
        null,
        Validators.compose([Validators.required, ValidationService.validateEmailPattern])
      ]
    });
  }

  ngOnInit() {}

  forgotPassword(value) {
    if (this.forgotPasswordForm.valid) {
      this.errorMsg = '';
      this.successMsg = '';
      this.appService.loader('start');
      this.authService
        .forgotPassword(value)
        .subscribe(
          res => {
            const msgKey = 'message';
            const { [msgKey]: message } = res;
            this.successMsg = message;
            this.forgotPasswordForm.reset();
            this.commonHandler();
          },
          err => {
            const { message } = err;
            this.is_email_verified = message.is_email_verified;
            this.errorMsg = message.message;
            this.commonHandler();
          }
        );
    }
  }

  reSendEmail() {
    this.successMsg = '';
    this.errorMsg = '';
    this.appService.loader('start');
    this.authService
      .reSendEmail(this.forgotPasswordForm.value.email)
      .subscribe((res) => {
        const msgKey = 'message';
        const { [msgKey]: message } = res;
        this.successMsg = message;
        this.appService.loader('stop');
        this.forgotPasswordForm.reset();
        this.ref.detectChanges();
    },
    err => {
      const { message } = err;
      this.errorMsg = message;
      this.is_email_verified = true;
      this.appService.loader('stop');
      this.ref.detectChanges();
    }
    );
}


  commonHandler() {
    this.appService.loader('stop');
    this.ref.detectChanges();
  }

  redirectToLogin() {
    this.router.navigate([LOGIN.URL]);
  }
}
