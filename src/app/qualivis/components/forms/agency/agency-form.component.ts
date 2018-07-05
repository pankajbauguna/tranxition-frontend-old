import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationMessages, HelpMessages, FORMS, APIUrls, INFO_ICON, CONTACT_INFO, COMPANY } from '../../../../shared/constants';
import { ValidationService, AppService } from '../../../../shared';
import { AgencyService } from '../../../services';
import { ApplicationService } from '../../../services';

@Component({
  selector: 'app-agency-form',
  templateUrl: './agency-form.component.html',
  styleUrls: ['./agency-form.component.scss'],
})
export class AgencyFormComponent implements OnInit {

  public role: any;
  public isReplaceDocument;
  public agencyForm: FormGroup;
  public messages = ValidationMessages;
  public helpMessages = HelpMessages || {};
  public infoIcon = INFO_ICON;
  public applicationStatus;
  public downloadPath = APIUrls.DOWNLOAD_HOST;
  public applicationError;
  public applicationErrorState;
  public showActionBtn = true;

  constructor(
    private appService: AppService,
    private agencyService: AgencyService,
    private applicationService: ApplicationService,
    private ref: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // set form group data for personal form
    this.agencyForm = formBuilder.group({
      summary: [null, Validators.required],
      background: [null, Validators.required],
      improvement: [null, Validators.required],
    });

    this.route.data.subscribe(
      ({ agency, user, application, userRole: { role } }) => {
        this.getAgencyData(agency, user);
        this.isReplaceDocument = this.applicationService.get('filledForms')['isReplaceDocument'];
        this.role = role;
        this.applicationError = application.error;
        this.applicationErrorState = application.errorState;
        this.setApplicationState();
      }
    );
    this.setApplicationState();
  }

  ngOnInit() { }

  getAgencyData(agencyInfo, personalInfo) {
    if (agencyInfo) {
      const { executiveSummary, corporateBackground, performancePlan } = agencyInfo;
      this.agencyForm.patchValue({
        summary: executiveSummary,
        background: corporateBackground,
        improvement: performancePlan
      });
    }
  }

  submitAgencyInfo(isNext) {
    if (this.agencyForm.valid) {
      const value = this.agencyForm.getRawValue();
      this.appService.loader('start');
      const dataObj = {
        executiveSummary : value.summary,
        corporateBackground : value.background,
        performancePlan : value.improvement
      };
      this.agencyService.save(dataObj)
        .subscribe(
          (res) => {
            const msgKey = 'message';
            const { [msgKey]: message } = res;
            if (!isNext) {
              this.appService.logOut();
            } else {
              this.responseHandler(message, false);
              this.router.navigate([FORMS.URL]);
            }
          },
          (err) => {
            const { message } = err;
            this.responseHandler(message, false);
          }
        );
    } else {
      ValidationService.validateAllFormFields(this.agencyForm);
    }
  }
  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  redirectTo(): void {
    this.router.navigate([COMPANY.URL]);
  }

  setApplicationState() {
    this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
    this.showActionBtn = this.role === 'user' && this.applicationStatus !== 'pending';
  }
}
