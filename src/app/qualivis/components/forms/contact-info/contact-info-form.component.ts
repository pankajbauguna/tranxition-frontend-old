import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras  } from '@angular/router';

import {
  ValidationMessages,
  COMPANY,
  EXISTING_AGENCY_INFO,
  AGENCY,
  LOGGED_USER_INFO_ACTION
} from '../../../../shared/constants';
import { ValidationService, AppService, StoreService } from '../../../../shared';
import { UserService, ApplicationService } from '../../../services';

@Component({
  selector: 'app-contact-info-form',
  templateUrl: './contact-info-form.component.html',
  styleUrls: ['./contact-info-form.component.scss'],
})
export class ContactInfoFormComponent implements OnInit, OnDestroy {

  public personalForm: FormGroup;
  public messages = ValidationMessages;
  public applicationStatus;
  errorMsg= '';
  filledContactInfo = false;
  isHavingEnvelopeId = false;
  public phoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public isExistingAgency = false;
  public role = '';
  public routeSubscriber: any;
  public userSubscriber: any;
  public isReplaceDocument;
  public applicationError;
  public applicationErrorState;
  public applicationId;
  public showActionBtn = true;

  constructor(
    private formbuilder: FormBuilder,
    private appService: AppService,
    private userService: UserService,
    private applicationService: ApplicationService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService
  ) {
    // set form group data for personal form
    this.personalForm = formbuilder.group({
      name: [null, Validators.required],
      title: [null, Validators.required],
      territory: [null, ValidationService.textAndSpacesOnly],
      officePhone: [null, Validators.compose([Validators.required, ValidationService.validPhoneNumber])],
      cellPhone: [null, Validators.compose([ValidationService.emptyOrValidPhoneNumber])],
      fax: [null, ValidationService.emptyOrValidPhoneNumber]
    });

    this.userSubscriber = this.userService.store.subscribe(res => this.populateData(res));

    this.storeService.state.subscribe(
      action => {
        const { type, payload } = action;
        if (type === LOGGED_USER_INFO_ACTION) {
          this.role = payload['role'];
        }
      }
    );

    this.routeSubscriber = this.route.data.subscribe(({ user, application, userRole }) => {
      this.populateData(user);
      this.isReplaceDocument = this.applicationService.get('filledForms')['isReplaceDocument'];
      this.role = userRole.role;
      this.applicationError = application.error;
      this.applicationErrorState = this.applicationService.get('filledForms')['applicationErrorState'];
      this.applicationId = application._id;
      if (application.envelopeId) {
        this.isHavingEnvelopeId = true;
        this.personalForm.get('name').disable();
      }
      this.setApplicationState();
    });
  }

  ngOnInit() {
    this.setApplicationState();
  }

  ngOnDestroy() {
    this.routeSubscriber.unsubscribe();
    this.userSubscriber.unsubscribe();
  }

  populateData(user) {
    const { personal } = user;
    if (personal) {
      this.filledContactInfo = true;
      this.personalForm.patchValue(personal);
    }
    this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
  }

  submitPersonalInfo(isNext) {
    if (this.personalForm.valid) {
      this.errorMsg = '';
      this.appService.loader('start');
      this.userService
        .update( this.personalForm.value, this.applicationId )
        .subscribe((res) => {
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.filledContactInfo = true;
          this.applicationService.forceDispatch();
          if (!isNext) {
           this.appService.logOut();
          } else {
            this.responseHandler(message, false);
            this.redirectTo(false);
          }
        },
        (err) => {
          const { message } = err;
          this.responseHandler(message, true);
        });
    } else {
      ValidationService.validateAllFormFields(this.personalForm);
    }
  }

  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  onPhoneNumValueChanged(value: any) {
    const mobileNumberControl = this.personalForm.get('cellPhone');
    // Using setValidators to add and remove validators
    if (!value) {
      mobileNumberControl.setValidators([Validators.required, ValidationService.validPhoneNumber]);
    } else {
      mobileNumberControl.setValidators([ValidationService.validPhoneNumber]);
    }
    mobileNumberControl.updateValueAndValidity(); // Need to call this to trigger a update
  }

  redirectTo(isBack): void {
    const url = isBack ? EXISTING_AGENCY_INFO.URL : this.isExistingAgency ? AGENCY.URL : COMPANY.URL;
    this.router.navigate([url]);
  }

  setApplicationState() {
    this.isExistingAgency = this.applicationService.get('isExistingAgency');
    this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
    this.showActionBtn = this.role === 'user' && this.applicationStatus !== 'pending';
  }
}
