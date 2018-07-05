import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ValidationService, AppService } from '../../../shared';
import { ValidationMessages, APP_LOGO, LOGIN, CONTACT_US_MAIL } from '../../../shared/constants';
import { AuthService } from '../../services';
@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnInit {

  public registerForm: FormGroup;
  public errorMsg = '';
  public messages = ValidationMessages;
  public appLogo = APP_LOGO;
  public successMsg = '';
  public agencyName = '';
  public agencyCode = '';
  public claimedAccountEmail = null;
  public contactUs = CONTACT_US_MAIL;

  constructor(
    private router: Router,
    private formbuilder: FormBuilder,
    private authService: AuthService,
    private ref: ChangeDetectorRef,
    private appService: AppService,
    private activatedRoute: ActivatedRoute
  ) {
    this.registerForm = formbuilder.group({
      agency_code: [
        ''
      ],
      email: [
        null,
        Validators.compose([Validators.required, ValidationService.validateEmailPattern])
      ],
      password: [
        null,
        Validators.compose([Validators.required, ValidationService.validatePasswordPattern])
      ],
      confirmPassword: [
        null,
        Validators.compose([Validators.required])
      ]
    }, { validator: ValidationService.matchPassword });
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParams['code']) {
      const code = this.activatedRoute.snapshot.queryParams['code'];
      this.getAgencyDetailFromCode(code);
    }
  }

  getAgencyDetailFromCode(code) {
    this.appService.loader('start');
    this.authService
      .getAgencyDetailFromCode(code)
      .subscribe((res) => {
        if (!res) {
          this.errorMsg = ValidationMessages.INVALID_CODE;
          this.appService.loader('stop');
          this.ref.detectChanges();
        } else {
          const messageKey = 'name';
          const dynamicEmailKey = 'email';
          const { [messageKey]: name, [dynamicEmailKey]: email } = res;
          this.agencyName = name;
          this.agencyCode = code;
          this.claimedAccountEmail = email;
          this.appService.loader('stop');
          this.ref.detectChanges();
        }
      },
      (err) => {
        const { message } = err;
        this.errorMsg = message;
        this.appService.loader('stop');
        this.ref.detectChanges();
      });
  }

  registerUser(value) {
    if (this.registerForm.valid) {
      this.errorMsg = '';
      this.successMsg = '';
      if (this.agencyCode) {
        value.agency_code = this.agencyCode;
      }
      this.appService.loader('start');
      this.authService
        .registerUser(value)
        .subscribe((res) => {
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.successMsg = message;
          this.appService.loader('stop');
          this.registerForm.reset();
          this.ref.detectChanges();
        },
        err => {
          const { message } = err;
          this.errorMsg = message;
          this.appService.loader('stop');
          this.ref.detectChanges();
        }
        );
    }
  }

  redirectToLogin() {
    this.router.navigate([LOGIN.URL]);
  }
}
