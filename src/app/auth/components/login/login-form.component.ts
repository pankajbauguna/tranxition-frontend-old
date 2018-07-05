import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService, AppService } from '../../../shared';
import { ValidationMessages, APP_LOGO, ADMIN_DASHBORAD } from '../../../shared/constants';
import { AuthService } from '../../services';
import { findRouteURL } from '../../../shared/utils';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {

  public loginForm: FormGroup;
  public errorMsg = '';
  public successMsg = '';
  public messages = ValidationMessages;
  public appLogo = APP_LOGO;
  public is_email_verified = true;

  constructor(
    private router: Router,
    private formbuilder: FormBuilder,
    private authService: AuthService,
    private ref: ChangeDetectorRef,
    private appService: AppService
  ) {
    // set form group data for login form
    this.loginForm = formbuilder.group({
      email: [
        null,
        Validators.compose([Validators.required, ValidationService.validateEmailPattern])
      ],
      password: [null, Validators.required]
    });
  }

  ngOnInit() {}

  // @description - method to send user request for logging into the portal
  loginUser(value: any): void {
    this.errorMsg = '';
    this.successMsg = '';
    this.appService.loader('start');
    this.authService
      .login(value)
      .subscribe(
        token => {
          this.redirectTo(ADMIN_DASHBORAD.NAME);
        },
        err => {
          const { message} = err;
          this.is_email_verified = message.is_email_verified;
          this.errorMsg = message.message;
          this.appService.loader('stop');
          this.ref.detectChanges();
        }
      );
  }

  reSendEmail(value: any) {
      this.successMsg = '';
      this.errorMsg = '';
      this.appService.loader('start');
      this.authService
        .reSendEmail(value.email)
        .subscribe((res) => {
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.successMsg = message;
          this.appService.loader('stop');
          this.loginForm.reset();
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

  redirectTo(path): void {
    this.router.navigate([findRouteURL(path)]);
  }
}
