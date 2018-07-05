import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ValidationMessages } from '../../../../shared/constants';
import { ValidationService, AppService } from '../../../../shared';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
})
export class ChangePasswordFormComponent implements OnInit {
  public changePasswordForm: FormGroup;
  public messages = ValidationMessages;
  public errorMsg = '';
  public successMsg = '';
  constructor(
    private formbuilder: FormBuilder,
    private appService: AppService,
    private userService: UserService,
    private ref: ChangeDetectorRef
  ) {
    // set form group data for change password form
    this.changePasswordForm = formbuilder.group({
      oldPassword: [null, Validators.required],
      password: [
        null,
        Validators.compose([Validators.required, ValidationService.validatePasswordPattern])
      ],
      confirmPassword: [null, Validators.required]
    }, {
      validator: ValidationService.matchPassword // your validation method
    });
  }

  ngOnInit() { }

  changePassword(value) {
    if (this.changePasswordForm.valid) {
      this.errorMsg = '';
      this.successMsg = '';
      this.appService.loader('start');
      this.userService
        .changePassword(value)
        .subscribe((res) => {
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.successMsg = message;
          this.changePasswordForm.reset();
          this.commonHandler();
        },
        (err) => {
          const { message } = err;
          this.errorMsg = message;
          this.commonHandler();
        });
    }
  }

  commonHandler() {
    this.appService.loader('stop');
    this.ref.detectChanges();
  }
}
