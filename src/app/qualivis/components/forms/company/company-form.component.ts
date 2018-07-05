import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import { Company } from '../../../../shared/models';
import { ValidationMessages, DefaultExpiryYear, AGENCY, CONTACT_INFO } from '../../../../shared/constants';
import { ValidationService } from '../../../../shared/validation.service';
import { CompanyService, ApplicationService } from '../../../services';
import { AppService } from '../../../../shared';
import { findRouteURL } from '../../../../shared/utils';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
})
export class CompanyFormComponent implements OnInit {
  public companyForm: FormGroup;
  public messages = ValidationMessages;
  public controls: any;
  public states = [];
  public commissionFB: any;
  public socialFB: any;
  public glInsuranceFB: any;
  public plInsuranceFB: any;
  public wcInsuranceFB: any;
  public eoInsuranceFB: any;
  public addressFB: any;
  public physicalAddressFB: any;
  public billingAddressFB: any;
  public sameAsPhysicalAddress = false;
  public filledCompanyInfo = false;
  public applicationStatus;
  public minExpirationDate: Date;
  public sourceSubscriber: any;
  public isReplaceDocument;
  public taxMask = [/\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  public jcMask = [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  public plInsuranceSameAsGL = false;
  public wcInsuranceSameAsGL = false;
  public applicationError;
  public applicationErrorState;
  public showActionBtn = true;

  public currencyMask = createNumberMask({
    prefix: '',
    thousandsSeparatorSymbol: ',',
    allowDecimal: true
  });

  public role: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formbuilder: FormBuilder,
    private companyService: CompanyService,
    private appService: AppService,
    private applicationService: ApplicationService,
    private ref: ChangeDetectorRef
  ) {
    // validation objects
    const address = {
      physical: {
        address1: [null, Validators.required],
        address2: [null],
        city: [null, Validators.compose([Validators.required, ValidationService.textAndSpacesOnly])],
        state: [null, Validators.required],
        zipcode: [null, Validators.compose([Validators.required, ValidationService.isUSZipCode])]
      },
      billing: {
        address1: [null, Validators.required],
        address2: [null],
        city: [null, Validators.compose([Validators.required, ValidationService.textAndSpacesOnly])],
        state: [null, Validators.required],
        zipcode: [null, Validators.compose([Validators.required, ValidationService.isUSZipCode])],
      }
    };

    const glInsurance = {
      insurerName: [null, Validators.required],
      effectiveDate: [null, Validators.compose([Validators.required, ValidationService.isDate])],
      expirationDate: [null, Validators.compose([Validators.required, ValidationService.isDate, ValidationService.isValidExpirationDate])],
      aggregate: [null, Validators.required],
      occurrence: [null, Validators.required],
      excessUmbrella: [null]
    };

    const plInsurance = {
      insurerName: [null, Validators.required],
      effectiveDate: [null, Validators.compose([Validators.required, ValidationService.isDate])],
      expirationDate: [null, Validators.compose([Validators.required, ValidationService.isDate, ValidationService.isValidExpirationDate])],
      aggregate: [null, Validators.compose([Validators.required, ValidationService.isRealNumber])],
      occurrence: [null, Validators.compose([Validators.required, ValidationService.isRealNumber])]
    };

    const wcInsurance = {
      insurerName: [null, Validators.required],
      effectiveDate: [null, Validators.compose([Validators.required, ValidationService.isDate])],
      expirationDate: [null, Validators.compose([Validators.required, ValidationService.isDate, ValidationService.isValidExpirationDate])],
      occurrence: [null, Validators.compose([Validators.required, ValidationService.isRealNumber])]
    };

    const eoInsurance = {
      insurerName: [null],
      effectiveDate: [null, ValidationService.isDate],
      expirationDate: [null, Validators.compose([ValidationService.isDate, ValidationService.isValidExpirationDate])],
      aggregate: [null],
      occurrence: [null]
    };

    const socialMedia = {
      linkedIn: [null, ValidationService.validateLinkedInPattern],
      twitter: [null],
      facebook: [null, ValidationService.validateFacebookPattern]
    };

    const jointCommission = {
      id: [null],
      effectiveDate: [null],
      expirationDate: [null]
    };

    // create form controls for each object
    this.physicalAddressFB = formbuilder.group(address.physical);
    this.billingAddressFB = formbuilder.group(address.billing);
    this.addressFB = formbuilder.group({
      physical: this.physicalAddressFB,
      billing: this.billingAddressFB
    });

    this.commissionFB = formbuilder.group(jointCommission);
    this.socialFB = formbuilder.group(socialMedia);
    this.glInsuranceFB = formbuilder.group(glInsurance);
    this.plInsuranceFB = formbuilder.group(plInsurance);
    this.wcInsuranceFB = formbuilder.group(wcInsurance);
    this.eoInsuranceFB = formbuilder.group(eoInsurance);

    // set form group data for company form
    this.companyForm = formbuilder.group({
      name: [null, Validators.required],
      employeeNumber: [null, Validators.required],
      taxId: [null, Validators.compose([Validators.required, ValidationService.validateTaxIdPattern])],
      website: [null, Validators.compose([Validators.required, ValidationService.validateDomainOrUrlPattern])],
      socialMedia: this.socialFB,
      address: this.addressFB,
      jointCommission: this.commissionFB,
      glInsurance: this.glInsuranceFB,
      plInsurance: this.plInsuranceFB,
      wcInsurance: this.wcInsuranceFB,
      eoInsurance: this.eoInsuranceFB,
    });

    this.controls = this.companyForm.controls;

    // Set default values
    this.companyForm.patchValue({ 'employeeNumber': '1-10' });
    this.minExpirationDate = new Date();

    this.route.data.subscribe(
      ({ states, company, application, userRole: { role } }) => {
        if (states) {
          this.states = states.message;
        }
        if (!!company) {
          this.filledCompanyInfo = true;
          this.populateData(company);
        }
        this.role = role;
        this.applicationError = application.error;
        this.applicationErrorState = application.errorState;
        this.setApplicationState();
      }
    );
  }

  ngOnInit() {
    this.setApplicationState();
    // occurane and aggrege for errors and ommission are either bot required or both optional
    this.eoInsuranceFB.get('aggregate').valueChanges.subscribe(data => this.onAggregateChanged(data));
    this.eoInsuranceFB.get('occurrence').valueChanges.subscribe(data => this.onOccurrenceChanged(data));

    const effectiveDate = this.commissionFB.get('effectiveDate');
    const expirationDate = this.commissionFB.get('expirationDate');
    const TJCID = this.commissionFB.get('id');
    if (!TJCID.value) {
      effectiveDate.disable();
      expirationDate.disable();
    }

    // Dynamically set/reset expiration and effective date validation if TJCID preset or not.
    this.commissionFB.get('id').valueChanges.subscribe(
      (value) => {
        const effectiveDateValidator = !!value ? [Validators.required, ValidationService.isDate] : [];
        const expirationDateValidator = !!value ?
        [Validators.required, ValidationService.isDate, ValidationService.isValidExpirationDate] : [];

        effectiveDate.setValidators(effectiveDateValidator);
        expirationDate.setValidators(expirationDateValidator);

        if (!value) {
          effectiveDate.updateValueAndValidity();
          expirationDate.updateValueAndValidity();
          effectiveDate.patchValue('');
          expirationDate.patchValue('');
          effectiveDate.disable();
          expirationDate.disable();
        } else {
          effectiveDate.enable();
          expirationDate.enable();
        }
      }
    );
  }

  eoClearValidators() {
    const aggregateFormControl = this.eoInsuranceFB.get('aggregate');
    const occurrenceFormControl = this.eoInsuranceFB.get('occurrence');
    const effectiveDateFormControl = this.eoInsuranceFB.get('effectiveDate');
    const expirationDateFormControl = this.eoInsuranceFB.get('expirationDate');

    aggregateFormControl.clearValidators();
    occurrenceFormControl.clearValidators();
    effectiveDateFormControl.clearValidators();
    expirationDateFormControl.clearValidators();
  }

  eoSetValidators() {
    const aggregateFormControl = this.eoInsuranceFB.get('aggregate');
    const occurrenceFormControl = this.eoInsuranceFB.get('occurrence');
    const effectiveDateFormControl = this.eoInsuranceFB.get('effectiveDate');
    const expirationDateFormControl = this.eoInsuranceFB.get('expirationDate');

    aggregateFormControl.setValidators(Validators.compose([Validators.required, ValidationService.isRealNumber]));
    occurrenceFormControl.setValidators(Validators.compose([Validators.required, ValidationService.isRealNumber]));
    effectiveDateFormControl.setValidators(Validators.compose([Validators.required]));
    expirationDateFormControl.setValidators(Validators.compose([Validators.required]));
  }

  onAggregateChanged(value: any) {
    const aggregateFormControl = this.eoInsuranceFB.get('aggregate');
    const occurrenceFormControl = this.eoInsuranceFB.get('occurrence');

    const occValue = occurrenceFormControl.value;
    // Using setValidators to add and remove validators
    if ((!value || (value && value.length === 0)) && (!occValue || (occValue && occValue.length === 0))) {
      this.eoClearValidators();
    } else {
      this.eoSetValidators();
    }
    aggregateFormControl.updateValueAndValidity({ onlySelf: true, emitEvent: false }); // Need to call this to trigger a update
    occurrenceFormControl.updateValueAndValidity({ onlySelf: true, emitEvent: false }); // Need to call this to trigger a update
  }

  onOccurrenceChanged(value: any) {
    const aggregateFormControl = this.eoInsuranceFB.get('aggregate');
    const occurrenceFormControl = this.eoInsuranceFB.get('occurrence');

    const aggValue = aggregateFormControl.value;
    // Using setValidators to add and remove validators
    if ((!value || (value && value.length === 0)) && (!aggValue || (aggValue && aggValue.length === 0))) {
      this.eoClearValidators();
    } else {
      this.eoSetValidators();
    }
    aggregateFormControl.updateValueAndValidity({ onlySelf: true, emitEvent: false }); // Need to call this to trigger a update
    occurrenceFormControl.updateValueAndValidity({ onlySelf: true, emitEvent: false }); // Need to call this to trigger a update
  }

  /**
   * @description
   * Populate form data and call other populate functions
   * @param {Company} company Company data get from route resolver
   */
  populateData(company: Company) {
    this.companyForm.patchValue(company);
    this.populateIsBillingAddressSameAsPhysical();
    this.populateIsPLInsurerSameAsGL();
    this.populateIsWCInsurerSameAsGL();
  }

  /**
   * @description
   * Populate same as physical address chechbox status and call function to set billing address.
   */
  populateIsBillingAddressSameAsPhysical() {
    const physical = this.addressFB.get('physical').value;
    const billing = this.addressFB.get('billing').value;

    const isSame = this.hasSameData(physical, billing);
    this.sameAsPhysicalAddress = isSame;
    this.toggleReadOnly(this.billingAddressFB, isSame, true);
  }

  /**
   * @description
   * Populate same as general information chechbox status and call function to set professional liability.
   */
  populateIsPLInsurerSameAsGL() {
    const {
      insurerName,
      effectiveDate,
      expirationDate
    } = this.plInsuranceFB.value;

    const isSame = this.hasSameData({ insurerName, effectiveDate, expirationDate });
    this.plInsuranceSameAsGL = isSame;
    this.toggleReadOnly(this.plInsuranceFB, isSame, false);
  }

  /**
   * @description
   * Populate same as general information chechbox status and call function to set workers comp.
   */
  populateIsWCInsurerSameAsGL() {
    const {
      insurerName,
      effectiveDate,
      expirationDate
    } = this.wcInsuranceFB.value;

    const isSame = this.hasSameData({ insurerName, effectiveDate, expirationDate });
    this.wcInsuranceSameAsGL = isSame;
    this.toggleReadOnly(this.wcInsuranceFB, isSame, false);
  }

  submitCompanyInfo(isNext): void {
    // update value and validity for joint commission
    const effectiveDate = this.commissionFB.get('effectiveDate');
    const expirationDate = this.commissionFB.get('expirationDate');
    effectiveDate.updateValueAndValidity();
    expirationDate.updateValueAndValidity();

    if (this.companyForm.valid) {
      this.appService.clearToaster();
      this.appService.loader('start');
      this.companyService
        .save(this.companyForm.getRawValue())
        .subscribe(
          res => {
            const msgKey = 'message';
            const { [msgKey]: message } = res;
            this.filledCompanyInfo = true;
            if (!isNext) {
              this.appService.logOut();
            } else {
              this.responseHandler(message, false);
              this.router.navigate([AGENCY.URL]);
            }
          },
          err => {
            const { message } = err;
            this.responseHandler(message, true);
          }
        );
    } else {
      ValidationService.validateAllFormFields(this.companyForm);
    }
  }

  /**
   * @description
   * Common response handler to stop loader, display toastr and detect changes or success response.
   * @param {String} message Success message
   * @param {Boolean} allowClose Allo user to close toastr.
   */
  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message, true);
    this.ref.detectChanges();
  }

  /**
   * @description
   * Set readonly property on status of checkbox
   * @param {Object} formBuilder Form builder instance of each form
   * @param {Boolean} bool Checkbox value
   * @param {Boolean} isBilling Use to disable particular field instead of whole form.
   */
  toggleReadOnly(formBuilder, bool, isBilling = false) {
    const action = bool ? 'disable' : 'enable';

    if (!isBilling) {
      const insurer = formBuilder.get('insurerName');
      const effectiveDate = formBuilder.get('effectiveDate');
      const expirationDate = formBuilder.get('expirationDate');
      if (insurer) {
        insurer[action]();
      }

      if (effectiveDate) {
        effectiveDate[action]();
      }

      if (expirationDate) {
        expirationDate[action]();
      }
    } else {
      formBuilder[action]();
    }
  }

  /**
   * @description
   * onChange hanlder of checkbox used for same value
   * Copy data and toggle readonly property by function call
   * @param {Event} evt Onchange event
   * @param {String} destName Name of destination in which data copied
   */
  checkBoxAction(evt, destName) {
    const { target: { checked } } = evt;
    let sourceFB, destFB, defaultValue, sourceValue, isBilling = true;
    switch (destName) {
      case 'billing':
        sourceFB = this.physicalAddressFB;
        destFB = this.billingAddressFB;
        defaultValue = { address1: '', address2: '', city: '', state: '', zipcode: '' };
        sourceValue = sourceFB.value;
        this.sameAsPhysicalAddress = checked;
        break;
      case 'professional-liablility':
        destFB = this.plInsuranceFB;
        this.plInsuranceSameAsGL = checked;
        break;
      case 'workers-comp':
        destFB = this.wcInsuranceFB;
        this.wcInsuranceSameAsGL = checked;
        break;
    }

    if (destName !== 'billing') {
      sourceFB = this.glInsuranceFB;
      defaultValue = {
        insurerName: '',
        effectiveDate: '',
        expirationDate: ''
      };
      sourceValue = sourceFB.value;
      isBilling = false;
    }

    const info = { sourceFB, destFB, checked, destName, defaultValue, sourceValue };
    this.copyData(info);
    this.toggleReadOnly(destFB, checked, isBilling);
  }

  /**
   * @description
   * Copy data from source form builder to destination form builder
   * Destination data will be in sync with source any change in source will reflect in destination checkbox is checked
   * Syncing is achived using form control subcribe and on uncheck unsubscribe changes
   * @param {Object} info Required information to copy data from source to destination.
   */
  copyData(info) {
    const { sourceFB, destFB, checked, destName, defaultValue, sourceValue } = info;
    this.sourceSubscriber = this.sourceSubscriber || {};
    if (checked) {
      if (!this.sourceSubscriber[destName]) {
        this.setValueSubForms(destFB, destName, sourceValue);
      }
      this.sourceSubscriber[destName] = sourceFB.valueChanges
        .subscribe(res => this.setValueSubForms(destFB, destName, res));
          } else {
      if (this.sourceSubscriber[destName]) {
        this.sourceSubscriber[destName].unsubscribe();
        this.sourceSubscriber[destName] = null;
      }
        destFB.patchValue(defaultValue);
      }
    }

  setValueSubForms(destFB, destName, data) {
    if (destName !== 'billing') {
      const { insurerName, effectiveDate, expirationDate } = data;
      destFB.patchValue({ insurerName, effectiveDate, expirationDate });
    } else {
      destFB.patchValue(data);
    }
  }

  // set expiry date according to form builder
  setExpirationDate(formBuilder, key) {
    const expirationDateField = formBuilder.get('expirationDate');
    const expirationDate = expirationDateField.value;
    const effectiveDate = formBuilder.get('effectiveDate').value;

    if (effectiveDate) {
      const parseEffectiveDate = new Date(effectiveDate);
      const effectiveYear = parseEffectiveDate.getFullYear();
      const result = ValidationService.isDate(formBuilder.get('effectiveDate'));
      if (!result) {
        parseEffectiveDate.setFullYear(effectiveYear + DefaultExpiryYear[key]);
        formBuilder.patchValue({ expirationDate: parseEffectiveDate });
      }

      const res = ValidationService.isValidExpirationDate(expirationDateField);
      expirationDateField.setErrors(res);
      if (res) {
        expirationDateField.markAsDirty();
      } else {
        expirationDateField.markAsPristine();
      }
    }
  }

  redirectTo() {
    this.router.navigate([CONTACT_INFO.URL]);
  }

  /**
   * @description
   * Util function to check data is same or not.
   * @param {Object} source Source data
   * @param {Object} dest Destination data
   * @return {Boolean}
   */
  hasSameData(source, dest = {}) {
    const destKeys = Object.keys(dest);
    if (!destKeys.length) {
      const { insurerName, effectiveDate, expirationDate } = this.glInsuranceFB.value;
      dest = { insurerName, effectiveDate, expirationDate };
    }
    const rawSource = JSON.stringify(source);
    const rawDest = JSON.stringify(dest);

    return rawSource === rawDest;
  }

  zipMask(rawValue) {
    return (rawValue && rawValue.length > 5 ?
      [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/] : [/\d/, /\d/, /\d/, /\d/, /\d/]);
  }

  setApplicationState() {
    this.filledCompanyInfo = this.applicationService.get('filledForms')['company'];
    this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
    this.showActionBtn = this.role === 'user' && this.applicationStatus !== 'pending';
  }
}
