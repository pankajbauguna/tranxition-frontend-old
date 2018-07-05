import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { ValidationService, AppService } from '../../../../shared';
import { ApplicationService, AgencyService, UserService } from '../../../services';
import { APIUrls } from '../../../../shared/constants';
import {
  CONTACT_INFO,
  AGENCY,
  EXISTING_AGENCY_INFO,
  FORMS,
  UPLOAD_DOCS,
  COMPANY
} from '../../../../shared/constants';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent implements OnInit, OnDestroy {

  contactInfo = '';
  companyInfo = '';
  agencyInfo = '';
  formsInfo = '';
  physicalAddressInfo = '';
  billingAddressInfo = '';
  uploadDocsInfo = '';
  userEmail = '';
  serviceLines = [] as any;
  staffingSpecialties = [] as any;
  public reviewApplicationForm: FormGroup;
  public errorMsg = '';
  public successMsg = '';
  public applicationStatus;
  public docusignSigned;
  public isExistingAgency;
  public comment;
  public applicationError = {};
  public confirmationModalRef: BsModalRef;
  public action;
  public routes = {
    'contact-info': CONTACT_INFO.URL,
    'agency': AGENCY.URL,
    'demographics': COMPANY.URL,
    'info': EXISTING_AGENCY_INFO.URL,
    'forms': FORMS.URL,
    'upload-docs': UPLOAD_DOCS.URL
  };

  public companyInsurances = [
    { 'value': 'GL', 'name': 'General Liability Insurer' },
    { 'value': 'PL', 'name': 'Professional Liability Insurer' },
    { 'value': 'WC', 'name': 'Workers Comp Insurer' },
    { 'value': 'EO', 'name': 'Errors & Omissions Insurer' }
  ];
  public insuranceName = '';
  public role: any;
  public applicationId;
  public documentPath = APIUrls.DOCUMENT_DOWNLOAD;
  public isApproveApplication;
  public routeSubscriber: any;
  public applicationSubscriber: any;
  public showAdminActionBtn = true;
  public showUserActionBtn = true;
  public reviewUserEmail = '';
  public isAuthorize = false;

  constructor(
    private appService: AppService,
    private applicationService: ApplicationService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private agencyService: AgencyService,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private router: Router,
    private elementRef: ElementRef,
    private modalService: BsModalService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.routeSubscriber = this.route.data.subscribe(
      ({ user, states, speciality, serviceLine, application, userRole: { role } }) => {
        this.docusignSigned = this.applicationService.get('docuSignStatus');
        this.docusignSigned = this.docusignSigned === 'signing_complete';
        this.applicationId = application._id;
        this.reviewUserEmail = application.reviewUserEmail;
        this.isAuthorize = application.isAuthorize;
        this.comment = application.comment;
        this.applicationError = application.error;
        this.role = role;
        this.showContactInfo(user);
        this.showCompanyData(states.message, application);
        this.showAgencyData(application);
        this.showFormsData(speciality, serviceLine, application);
        this.showUploadDocsData(application);
        this.setApplicationState();
      }
    );

    this.applicationSubscriber = this.applicationService
      .store
      .subscribe(() => {
        const userInfo = this.userService.get();
        if (userInfo) {
          this.showContactInfo(userInfo);
        }
        this.setApplicationState();
      });

    if (this.role === 'user') {
      this.reviewApplicationForm = this.formBuilder.group({
        financeReplaceReason: [],
        insuranceCertificateReplaceReason: [],
        referenceLettersReplaceReason: [],
        agencyLicenseReplaceReason: [],
        standingCertificateReplaceReason: [],
        commissionCertificateReplaceReason: [],
        personal: this.createBlankControls(),
        companyInfo: this.createBlankControls(),
        jointCommission: this.createBlankControls(),
        socialMedia: this.createBlankControls(),
        glInsurance: this.createBlankControls(),
        plInsurance: this.createBlankControls(),
        wcInsurance: this.createBlankControls(),
        eoInsurance: this.createBlankControls(),
        billingAddressInfo: this.createBlankControls(),
        physicalAddressInfo: this.createBlankControls(),
        executiveSummary: this.createBlankControls(),
        corporateBackground: this.createBlankControls(),
        performancePlan: this.createBlankControls(),
        staffingSpecialties: this.createBlankControls(),
        serviceLines: this.createBlankControls(),
        comment: ''
      });
    }
  }

  ngOnDestroy() {
    this.ref.detach();
    this.applicationSubscriber.unsubscribe();
    this.routeSubscriber.unsubscribe();
  }

  showContactInfo(userInfo) {
    if (userInfo) {
      const messageKey = 'personal';
      const { [messageKey]: personal, email } = userInfo;
      if (personal && personal.name) {
        this.contactInfo = personal;
      }
      this.userEmail = email;
    }
  }

  showCompanyData(states, application) {
    if (application && application.company) {
      const company = application.company;
      if (company.address) {
        const filterPhysicalAddressState = states.filter((state) => state._id === company.address.physical.state);
        if (filterPhysicalAddressState.length > 0) {
          company.address.physical.state = filterPhysicalAddressState[0].text;
        }
        this.physicalAddressInfo = company.address.physical;
        const filterBillingAddressState = states.filter((state) => state._id === company.address.billing.state);
        if (filterBillingAddressState.length > 0) {
          company.address.billing.state = filterBillingAddressState[0].text;
        }
        this.billingAddressInfo = company.address.billing;

        const filterCompanyInsurance = this.companyInsurances.filter(
          (insurance) => {
            if (company.insurance && company.insurance.insurerName) {
              return insurance.value === company.insurance.insurerName;
            }
          }
        );
        if (filterCompanyInsurance.length > 0) {
           this.insuranceName = filterCompanyInsurance[0].name;
        }
      }
      this.companyInfo = company;
    }
  }

  showAgencyData(application) {
    if (application && application.agency) {
      this.agencyInfo = application.agency;
    }
  }

  showFormsData(speciality, serviceLine, application) {
    if (application && application.forms) {
      const forms = application.forms;
      const staffingSpecialties = [];
      this.formsInfo = forms;
      if (forms.staffingSpecialties) {
        for (let i = 0; i < forms.staffingSpecialties.length; i++) {
          const filterSpecialty = speciality.filter(staff => staff._id && staff._id === forms.staffingSpecialties[i]);
          if (filterSpecialty.length > 0) {
            staffingSpecialties.push(filterSpecialty[0].name);
          }
        }
      }
      const serviceLines = [];
      if (forms.serviceLines) {
        for (let j = 0; j < forms.serviceLines.length; j++) {
          const filterServiceLine = serviceLine.filter(staff => staff._id && staff._id === forms.serviceLines[j]._id);
          if (filterServiceLine.length > 0) {
            serviceLines.push({
              name : filterServiceLine[0].name,
              participatingEntities: forms.serviceLines[j].participatingEntities
            });
          }
        }
      }
      this.staffingSpecialties = staffingSpecialties;
      this.serviceLines = serviceLines;
    }
  }

  getDocuSignUrl(): void {
    this.appService.loader('start');
    this.agencyService
      .getDocuSignUrl(this.applicationId)
      .subscribe((res: any) => {
        window.location.href = res.signingUrl;
      },
      (err) => {
        this.responseHandler(err.message, true);
        this.appService.loader('stop');
      });
  }

  downloadDocument(path) {
    if (path) {
       window.location.href = this.documentPath + '/' + btoa(path);
    }
  }

  approveApplication() {
    if (this.role === 'admin') {
      this.getDocuSignUrl();
    }
  }

  openConfirmationModal(action, template: TemplateRef<any>) {
    this.action = action;
    this.confirmationModalRef = this.modalService.show(template, { class: 'modal-sm', backdrop: 'static' });
  }

  confirm(): void {
    this.decline();
    if (this.action === 'returned' || this.action === 'rejected') {
      this.updateApplication(this.action);
    }
    if (this.action === 'approve') {
      this.approveApplication();
    }
  }

  decline(): void {
    this.confirmationModalRef.hide();
  }

  showUploadDocsData(application) {
    const formControlObj = {};
    if (this.role === 'admin') {
      formControlObj['comment'] = this.comment;
      formControlObj['personal'] = this.createControls('personal', 'Contact Info', 'Contact Info', 'personal', 1);
      formControlObj['companyInfo'] = this.createControls('companyInfo', 'Company Information', 'Demographics', 'company', 2);
      formControlObj['jointCommission'] = this.createControls('jointCommission', 'Joint Commission', 'Demographics', 'company', 3);
      formControlObj['socialMedia'] = this.createControls('socialMedia', 'Social Media', 'Demographics', 'company', 4);
      formControlObj['glInsurance'] = this.createControls('glInsurance', 'General Liability Insurance', 'Demographics', 'company', 5);
      formControlObj['plInsurance'] = this.createControls('plInsurance', 'Professional Liability Insurance', 'Demographics', 'company', 6);
      formControlObj['wcInsurance'] = this.createControls('wcInsurance', 'Workers Comp Insurance', 'Demographics', 'company', 7);
      formControlObj['eoInsurance'] = this.createControls('eoInsurance', 'Errors & Omissions Insurance', 'Demographics', 'company', 8);
      formControlObj['billingAddressInfo'] = this.createControls('billingAddressInfo', 'Billing Address', 'Demographics', 'company', 10);
      formControlObj['physicalAddressInfo'] = this.createControls('physicalAddressInfo', 'Physical Address', 'Demographics', 'company', 9);
      formControlObj['executiveSummary'] = this.createControls('executiveSummary', 'Executive Summary', 'Background', 'agency', 10);
      formControlObj['corporateBackground'] = this.createControls(
        'corporateBackground',
        'Corporate Background & Experience',
        'Background', 'agency', 11
      );
      formControlObj['performancePlan'] = this.createControls('performancePlan',
                    'Performance Improvement Plan',
                    'Background', 'agency',
                    12);
      formControlObj['staffingSpecialties'] = this.createControls(
        'staffingSpecialties',
        'Exhibit A: Staffing & Specialties Offered',
        'Forms',
        'forms', 13
      );
      formControlObj['serviceLines'] = this.createControls('serviceLines', 'Exhibit A1: Service Lines Offered', 'Forms', 'forms', 14);
    }
    if (application && application.uploadDocs) {
      this.uploadDocsInfo = application.uploadDocs;
      if (this.role === 'admin') {
        formControlObj['financeReplaceReason'] = this.createUploadDocsControls(
          application.uploadDocs['financial_statements'],
          'financial_statements'
        );
        formControlObj['insuranceCertificateReplaceReason'] = this.createUploadDocsControls(
          application.uploadDocs['insurance_certificate'],
          'insurance_certificate'
        );
        formControlObj['referenceLettersReplaceReason'] = this.createUploadDocsControls(
          application.uploadDocs['reference_letters'],
          'reference_letters'
        );
        formControlObj['agencyLicenseReplaceReason'] = this.createUploadDocsControls(
          application.uploadDocs['agency_license'],
          'agency_license'
        );
        formControlObj['standingCertificateReplaceReason'] = this.createUploadDocsControls(
          application.uploadDocs['standing_certificate'],
          'standing_certificate'
        );
        formControlObj['commissionCertificateReplaceReason'] = this.createUploadDocsControls(
          application.uploadDocs['commission_certificate'],
          'commission_certificate'
        );
      }
    }
    this.createDynamicFormBuilder(formControlObj);
  }

  createDynamicFormBuilder(formControlObj) {
    if (formControlObj) {
      this.reviewApplicationForm = this.formBuilder.group(formControlObj);
      setTimeout(() => this.checkCheckBoxSelectionOnPage(), 0);
    }
  }

  createBlankControls() {
    const contolLists = new FormArray([], {});
    const itemFG = new FormGroup({});
    contolLists.push(itemFG);
    return contolLists;
  }

  createControls(key, label, section, field, order) {
    const contolLists = new FormArray([], {});
    const itemFG = new FormGroup({});
    let errorFill;
    if (this.applicationError && this.applicationError[field] && this.applicationError[field][key]) {
      errorFill = this.applicationError[field][key];
    }
    const checkboxValue = errorFill && errorFill.isReplaced ? errorFill.isReplaced : false;
    const note = errorFill && errorFill.note ? errorFill.note : '';
    itemFG.addControl('isReplaced', new FormControl(checkboxValue));
    itemFG.addControl('note', new FormControl({value: note, disabled: !checkboxValue}));
    itemFG.addControl('subSection', new FormControl({value: label}));
    itemFG.addControl('section', new FormControl({value: section}));
    itemFG.addControl('order', new FormControl({value: order}));
    contolLists.push(itemFG);
    return contolLists;
  }

  createUploadDocsControls(uploadKeys, key) {
    const uploadDocsLists = new FormArray([], {});
    if (uploadKeys) {
      uploadKeys.map(
        uploadKey => {
          const itemFG = new FormGroup({});
          const checkboxValue = uploadKey.isReplaced ? uploadKey.isReplaced : false;
          const note = uploadKey.note ? uploadKey.note : '';
          itemFG.addControl('isReplaced', new FormControl(checkboxValue));
          itemFG.addControl('note', new FormControl({value: note, disabled: !checkboxValue}));
          itemFG.addControl('folderName', new FormControl(key));
          itemFG.addControl('randomString', new FormControl(uploadKey.randomString));
          uploadDocsLists.push(itemFG);
      });
    }
    return uploadDocsLists;
  }

  enableNote(e, statement, index) {
    const noteField = this.reviewApplicationForm.get(statement)['controls'][index].controls['note'];
    if (e.target.checked) {
      noteField.enable();
    } else {
      noteField.disable();
    }
    this.checkCheckBoxSelectionOnPage();
  }

  checkCheckBoxSelectionOnPage() {
    const checkBoxesLength = this.elementRef.nativeElement.querySelectorAll('input:checked').length;
    this.isApproveApplication = checkBoxesLength <= 0;
  }

  updateApplication(action) {
    const replaceArray = [];
    const dynamicKey = 'id';
    const { [dynamicKey]: id } = this.route.queryParams['value'];
    // Modify request object to send api request
    for (const key in this.reviewApplicationForm.value ) {
      if (
        key === 'financeReplaceReason' ||
        key === 'insuranceCertificateReplaceReason' ||
        key === 'referenceLettersReplaceReason' ||
        key === 'agencyLicenseReplaceReason' ||
        key === 'standingCertificateReplaceReason' ||
        key === 'commissionCertificateReplaceReason'
      ) {
        const formValue = this.reviewApplicationForm.value[key];
        for (let i = 0; i < formValue.length; i++) {
          replaceArray.push(formValue[i]);
        }
      }
    }
    const obj = {};
    if (replaceArray.length > 0) {
      obj['reviewDocs'] = replaceArray;
    }
    obj['comment'] = this.reviewApplicationForm.value['comment'];
    obj['state'] = action;
    const reviewApplicationFormObj = this.reviewApplicationForm.value;
    delete reviewApplicationFormObj.financeReplaceReason;
    delete reviewApplicationFormObj.insuranceCertificateReplaceReason;
    delete reviewApplicationFormObj.agencyLicenseReplaceReason;
    delete reviewApplicationFormObj.standingCertificateReplaceReason;
    delete reviewApplicationFormObj.referenceLettersReplaceReason;
    delete reviewApplicationFormObj.commissionCertificateReplaceReason;
    delete reviewApplicationFormObj.comment;
    // Remove 0 index
    const error = {
      'agency' : {},
      'company' : {},
      'forms' : {},
      'personal': {}
    };
    const errorState = [];
    for (const key in reviewApplicationFormObj ) {
      if (reviewApplicationFormObj.hasOwnProperty(key)) {
        const reviewObj = reviewApplicationFormObj[key][0];
        if (reviewObj.isReplaced) {
          if (reviewObj.section.value === 'Background') {
            error['agency'][key] = reviewObj;
            if (errorState.indexOf('agency') === -1) {
              errorState.push('agency');
            }
          }
          if (reviewObj.section.value === 'Demographics') {
            error['company'][key] = reviewObj;
            if (errorState.indexOf('company') === -1) {
              errorState.push('company');
            }
          }
          if (reviewObj.section.value === 'Forms') {
            error['forms'][key] = reviewObj;
            if (errorState.indexOf('forms') === -1) {
              errorState.push('forms');
            }
          }
          if (reviewObj.section.value === 'Contact Info') {
            error['personal'][key] = reviewObj;
            if (errorState.indexOf('personal') === -1) {
              errorState.push('personal');
            }
          }
        }
      }
    }
    obj['error'] = error;
    obj['errorState'] = errorState.join(',');
    this.appService.loader('start');
    this.applicationService.update(id, obj, 'update')
    .subscribe(
      (res) => {
        setTimeout(() => this.applicationService.fetch(id), 10);
        const msgKey = 'message';
        const { [msgKey]: message } = res;
        this.responseHandler(message, false);
      },
      (err) => {
        const { message } = err;
        this.responseHandler(message, true);
      }
    );
  }

  submitApplication(isResubmit) {
    if (isResubmit) {
      const state = {'state': 'pending'};
      const id = {id: this.applicationId};
      this.applicationService
        .update(this.applicationId, state, 'resubmit')
        .subscribe(
          res => {
            const msgKey = 'message';
            const { [msgKey]: message } = res;
            this.responseHandler(message, false);
          },
          err => {
            const { message } = err;
            this.responseHandler(message, true);
          }
        );
    } else {
      if (this.isExistingAgency) {
        if (!!this.formsInfo) {
          this.getDocuSignUrl();
        }
      } else {
        if (!!this.contactInfo && !!this.companyInfo && !!this.agencyInfo && !!this.formsInfo) {
          this.getDocuSignUrl();
        }
      }
    }
  }

  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  redirectTo(path): void {
    const dynamicKey = 'id';
    const { [dynamicKey]: id } = this.route.snapshot.queryParams;
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };
    this.router.navigate([path], navigationExtras);
  }

  setApplicationState() {
    if (!this.applicationService.data.hasOwnProperty('filledForms')) {
      return;
    }
    const { applicationStatus } = this.applicationService.get('filledForms');
    this.applicationStatus = applicationStatus;
    this.isExistingAgency = this.applicationService.get('isExistingAgency');
    this.showAdminActionBtn = this.role === 'admin' && this.applicationStatus === 'pending' && this.applicationService.get('isAuthorize');
    this.showUserActionBtn = this.role === 'user';
  }
}
