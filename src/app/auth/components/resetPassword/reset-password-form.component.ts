import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationService, AppService } from '../../../shared';
import { ValidationMessages, APP_LOGO, LOGIN } from '../../../shared/constants';
import { AuthService } from '../../services';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
})
export class ResetPasswordFormComponent implements OnInit {

  public appLogo = APP_LOGO;
  resetPasswordForm: FormGroup;
  errorMsg = '';
  messages = ValidationMessages;
  successMsg = '';
  isTokenValid = true;
  public resetPasswordKey: string;

  constructor(
    private router: Router,
    private formbuilder: FormBuilder,
    private authService: AuthService,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private appService: AppService
  ) {
    this.resetPasswordForm = formbuilder.group(
      {
        password: [
          null, Validators.compose([Validators.required, ValidationService.validatePasswordPattern])
        ],
        confirmPassword: [null, Validators.required]
      }, {
        validator: ValidationService.matchPassword // your validation method
      }
    );
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(
      ({ reset: { isTokenValid, reset_password_key, message } }) => {
        this.isTokenValid = isTokenValid;
        this.resetPasswordKey = reset_password_key;

        if (!isTokenValid) {
          this.errorMsg = message;
        } else {
          this.errorMsg = '';
        }
      }
    );
  }

  resetPassword(value) {
    if (this.resetPasswordForm.valid) {
      this.errorMsg = '';
      this.successMsg = '';
      this.appService.loader('start');

      value = { ...value, reset_password_key: this.resetPasswordKey };
      this.authService
        .resetPassword(value)
        .subscribe((res) => {
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.successMsg = message;
          this.appService.loader('stop');
          this.resetPasswordForm.reset();
          this.ref.detectChanges();
        },
        (err) => {
          const { message } = err.json();
          this.errorMsg = message;
          this.appService.loader('stop');
          this.ref.detectChanges();
        });
    }
  }

  redirectToLogin() {
    this.router.navigate([LOGIN.URL]);
  }
}
