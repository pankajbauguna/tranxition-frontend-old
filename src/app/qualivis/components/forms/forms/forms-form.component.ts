import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { ValidationMessages, HelpMessages, UPLOAD_DOCS, AGENCY, INFO_ICON } from '../../../../shared/constants';
import { ValidationService, AppService } from '../../../../shared';
import { FormsService } from '../../../services';
import { ApplicationService } from '../../../services';

@Component({
  selector: 'app-forms-form',
  templateUrl: './forms-form.component.html',
  styleUrls: ['./forms-form.component.scss'],
})
export class FormsFormComponent implements OnInit {

  public formsForm: FormGroup;
  public messages = ValidationMessages;
  public helpMessages = HelpMessages || {};
  public infoIcon = INFO_ICON;
  public applicationStatus;
  errorMsg= '';
  successMsg = '';
  pathName = '';
  staffingSpecialtiesLists: any;
  serviceLinesLists = [];
  staffingSpecialties = [];
  serviceLines = [];
  staffingResponse = false;
  public serviceLineControl: any;
  public role: any;
  public isReplaceDocument;
  public applicationError;
  public applicationErrorState;
  public showActionBtn = true;

  constructor(
    private appService: AppService,
    private formsService: FormsService,
    private applicationService: ApplicationService,
    private ref: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe(
      ({ forms, speciality, serviceLine, application, userRole: { role } }) => {
        this.staffingSpecialties = speciality;
        this.serviceLines = serviceLine;
        this.createDynamicFormBuilder(forms);
        this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
        this.isReplaceDocument = this.applicationService.get('filledForms')['isReplaceDocument'];
        this.applicationError = application.error;
        this.applicationErrorState = application.errorState;
        this.role = role;
      }
    );
  }

  ngOnInit() {
    this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
    this.showActionBtn = this.role === 'user' && this.applicationStatus !== 'pending';
  }

  createDynamicFormBuilder(forms) {
    this.serviceLineControl = this.createServiceLinesControls(forms);
    this.formsForm = this.formBuilder.group({
      staffingSpecialties: this.createStaffingSpecialitiesControls(forms),
      serviceLines: this.serviceLineControl,
      otherStaffingSpecialties: [forms.otherStaffingSpecialties ? forms.otherStaffingSpecialties : null],
      isOtherStaffingSpecialties: [forms.isOtherStaffingSpecialties ? forms.isOtherStaffingSpecialties : false]
    }, { validator: ValidationService.isOtherSpecialtiesSelected});
  }

  createStaffingSpecialitiesControls(forms) {
    const { staffingSpecialties } = forms;
    const staffingSpecialtiesLists = new FormArray([], {
      validators: forms.isOtherStaffingSpecialties ? [] : ValidationService.multipleCheckboxRequireOne()
    });
    this.staffingSpecialties.map(
      staffSpecial => {
        const itemFG = new FormGroup({});
        const key = staffSpecial._id;
        const checkboxValue = staffingSpecialties && staffingSpecialties[key];
        itemFG.addControl(staffSpecial._id, new FormControl(checkboxValue ? checkboxValue[key] : null));
        itemFG.addControl('key', new FormControl(staffSpecial._id));
        staffingSpecialtiesLists.push(itemFG);
    });

    return staffingSpecialtiesLists;
  }

  createServiceLinesControls(forms) {
    const serviceLinesLists = new FormArray([], {
      validators:
      [ValidationService.multipleCheckboxRequireOne(),
      ValidationService.multipleCheckboxRequireOneForServiceLines()]

    });

    const { serviceLines } = forms;
    this.serviceLines.map(
      service => {
        const itemFG = new FormGroup({});
        const key = service._id;
        const checkboxValue = serviceLines && serviceLines[key];
        itemFG.addControl(service._id, new FormControl(checkboxValue ? checkboxValue[key] : null));
        itemFG.addControl('participatingEntities', new FormControl(checkboxValue ? checkboxValue.participatingEntities : ''));
        itemFG.addControl('key', new FormControl(key));
        serviceLinesLists.push(itemFG);
    });

    return serviceLinesLists;
  }

  formsSubmit(isNext) {
    if (this.formsForm.valid) {
      this.appService.loader('start');
      this.formsService
        .save(this.formsForm.getRawValue())
        .subscribe(
          res => {
            const msgKey = 'message';
            const { [msgKey]: message } = res;
            if (!isNext) {
             this.appService.logOut();
            } else {
              this.responseHandler(message, false);
              this.router.navigate([UPLOAD_DOCS.URL]);
            }
          },
          err => {
            const { message } = err;
            this.responseHandler(message, false);
          }
        );
    } else {
      ValidationService.validateAllFormFields(this.formsForm);
    }
  }

  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  redirectToAgency(): void {
    this.router.navigate([AGENCY.URL]);
  }

  clearEntities(forms, index) {
    const serviceLines = [];
    serviceLines[index] = {
      participatingEntities: ''
    };
    this.formsForm.patchValue({
      serviceLines: serviceLines
    });
  }

  changeOther(e) {
    const staffingSpecialtiesControl = this.formsForm.get('staffingSpecialties');
    const otherStaffingSpecialtiesControl = this.formsForm.get('otherStaffingSpecialties');
    if (e.target.checked) {
      staffingSpecialtiesControl.setValidators([]);
    } else {
      otherStaffingSpecialtiesControl.setValidators([]);
      staffingSpecialtiesControl.setValidators([ValidationService.multipleCheckboxRequireOne()]);
      otherStaffingSpecialtiesControl.updateValueAndValidity();
    }
    staffingSpecialtiesControl.updateValueAndValidity(); // Need to call this to trigger a update
  }
}
