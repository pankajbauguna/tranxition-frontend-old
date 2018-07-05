import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ValidationMessages } from '../../../../shared/constants';
import { ValidationService, AppService } from '../../../../shared';
import { UserService } from '../../../services/user.service';
import { THANKS,CHANGE_USERNAME } from '../../../../shared/constants';

@Component({
  selector: 'app-change-username-form',
  templateUrl: './change-username-form.component.html',
  styleUrls: ['./change-username-form.component.scss'],
})
export class ChangeUsernameFormComponent implements OnInit {

  public changeUsernameForm: FormGroup;
  public messages = ValidationMessages;
  public errorMsg= '';
  public successMsg = '';
  public currentEmail = '';
  constructor(
    private formbuilder: FormBuilder,
    private appService: AppService,
    private userService: UserService,
    private ref: ChangeDetectorRef,
    private router: Router
  ) {
    // set form group data for change password form
    this.changeUsernameForm = formbuilder.group({
      new_email: [
        null,
        Validators.compose([Validators.required, ValidationService.validateEmailPattern])
      ],
      password: [ null, Validators.required ],
      accept_terms: [ false, Validators.required ]
    });
  }

  ngOnInit() {
    this.currentEmail = this.userService.get('email');
  }

  changeUsername(value) {
    if (!this.emailIsSameAsPrevious()) {
      return;
    }

    if (this.changeUsernameForm.valid) {
      this.errorMsg = '';
      this.successMsg = '';
      this.appService.loader('start');
      this.userService
        .changeUsername(value)
        .subscribe((res) => {
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.router.navigate([THANKS.URL],{ queryParams: {'suc':btoa(message),'back':btoa(CHANGE_USERNAME.URL)}});
          this.changeUsernameForm.reset();
          this.commonHandler();
        },
        (err) => {
          const { message } = err;
          this.errorMsg = message;
          this.commonHandler();
        });
    }
  }

  /**
   * @description Check if new emial is same as current email
   * @return {boolean}
   */
  emailIsSameAsPrevious() {
    const { value } = this.changeUsernameForm.get('new_email');

    if (value !== this.currentEmail ) {
      this.errorMsg = '';
      return true;
    }
    this.errorMsg = ValidationMessages.SAME_EMAIL;
    return false;
  }

  commonHandler() {
    this.appService.loader('stop');
    this.ref.detectChanges();
  }
}
