import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { UploadDocsService, ApplicationService } from '../../../services';

import {
  HelpMessages,
  ACCEPTED_FILE_FORMATS,
  INFO_ICON,
  ValidationMessages,
  FILE_SIZE_LIMIT
} from '../../../../shared/constants';
import { AppService } from '../../../../shared';
import { APIUrls } from '../../../../shared/constants';
import { findRouteURL } from '../../../../shared/utils';


@Component({
  selector: 'app-upload-docs-form',
  templateUrl: './upload-docs-form.component.html',
  styleUrls: ['./upload-docs-form.component.scss'],
})
export class UploadDocsFormComponent implements OnInit {

  public uploadDocsForm: FormGroup;
  public financial_statements = [[]];
  public insurance_certificate = [[]];
  public helpMessages = HelpMessages;
  public infoIcon = INFO_ICON;
  public agency_license = [];
  public commission_certificate = [];
  public standing_certificate = [];
  public reference_letters = [];
  public uploadDocValid = false;
  public applicationStatus;
  public isReplaceDocument;
  public isExistingAgency = false;
  public letters = [];
  public isTravelSelected = false;
  public selectedServices = [];
  public acceptedFileFormats = ACCEPTED_FILE_FORMATS.join(',');
  public role: any;
  public addMoreFinance = false;
  public addMoreInsurance = false;
  public applicationId;
  public documentPath = APIUrls.DOCUMENT_DOWNLOAD;
  public showActionBtn = true;
  public hasTJCID: boolean ;

  constructor(
    private router: Router,
    private uploadDocsService: UploadDocsService,
    private applicationService: ApplicationService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private appService: AppService
  ) {
    this.uploadDocsForm = new FormGroup({});

    this.route.data.subscribe(
      ({ uploadDocs, forms, serviceLines, userRole: { role } }) => {
        if (forms) {
          this.isTravelSelected = this.applicationService.get('isTravel');
          this.selectedServicesLines(forms, serviceLines);
        }
        this.isReplaceDocument = this.applicationService.get('filledForms')['isReplaceDocument'];
        this.role = role;
        if (!!uploadDocs) {
          this.populateData(uploadDocs);
        } else {
          this.pushServicesValue();
        }

        this.setApplicationState();
      }
    );
    this.setApplicationState();
  }

  ngOnInit() {
    const role = this.role;
    if (role === 'user') {
        this.uploadDocsForm = this.formBuilder.group({
          financeReplaceReason: [],
          insuranceCertificateReplaceReason: [],
          referenceLettersReplaceReason: [],
          agencyLicenseReplaceReason: [],
          standingCertificateReplaceReason: [],
          commissionCertificateReplaceReason: []
        });
    }
  }

  populateData(uploadDocs) {
    for (const key in uploadDocs) {
      if (uploadDocs.hasOwnProperty(key)) {
        this[key] = uploadDocs[key];
        if (key === 'insurance_certificate' || key === 'financial_statements') {
          if (this[key].length > 0 ) {
            if (this[key][this[key].length - 1].hasOwnProperty('randomString')) {
              this.setAddMoreStatus(key, true);
            }
          } else {
            this[key].push([]);
            this.setAddMoreStatus(key, false);
          }
        } else if (key === 'reference_letters') {
          this.letters = Object.assign([], uploadDocs[key]);
          if (this.letters.length > 0) {
            let newServices = [];
            const indexes = [];
            for (let i = 0; i < this.selectedServices.length; i++) { // if letters exist reshuffle selected services array
              indexes.push(this.selectedServices[i]);
              for (let j = 0; j < this.letters.length; j++) {
                if (this.selectedServices[i]['_id'] === this.letters[j]['_id']) {
                  newServices.push(this.selectedServices[i]);
                  indexes.pop();
                  break;
                }
              }
            }
            newServices = newServices.concat(indexes);
            this.selectedServices = Object.assign([], newServices);
          }
          const lettersLength = this.letters.length;
          if (lettersLength < this.selectedServices.length) { // add blank objects for non exisitnf dfiles for services
            const indexesLeft = this.selectedServices.length - lettersLength;
            for (let i = 0; i < indexesLeft; i++) {
              this.letters.push({});
            }
          }
        }
      }
    }

    const role = this.role;
    if (this.letters.length === 0) {
      this.pushServicesValue();
    }
  }

  enableNote(e, statement, index) {
    if (e.target.checked) {
      this.uploadDocsForm.get(statement)['controls'][index].controls['note'].enable();
    } else {
      this.uploadDocsForm.get(statement)['controls'][index].controls['note'].disable();
    }
  }

  uploadDocument(event: any, from, subFolder = '', index = '', serviceId = '', isReplaced, randomString): void {
    const uploadData = {};
    if (serviceId !== '') {
      uploadData['_id'] = serviceId;
    }
    uploadData['folderName'] = from;
    if (isReplaced) {
      uploadData['randomString'] = randomString;
    } else {
      uploadData['randomString'] = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    }
    uploadData['fileObj'] = {};
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size <= FILE_SIZE_LIMIT) {
        this.appService.loader('start');
        uploadData['fileObj']['name'] = event.target.files[0].name;
        if (subFolder) {
          uploadData['subFolder'] = subFolder;
        }
        const file: FileReader = new FileReader(); // convert file object to base64 file
        file.onload = (e) => {
          uploadData['fileObj']['dataUrl'] = file.result;
          this.uploadDocsService
          .save('uploadDocs', uploadData)
          .subscribe(
            res => {
              if (subFolder) {
                const data = event.target.files[0];
                data['randomString'] =  uploadData['randomString'];
                this[subFolder][index] = data;
                this.setAddMoreStatus(subFolder, true);
              } else {
                this[from] = [];
                this[from][0] =  event.target.files[0];
                this[from][0]['randomString'] = uploadData['randomString'];
              }
              this.uploadDocValid = res['message']['is_upload_docs_completed'];
              this.appService.loader('stop');
              this.ref.detectChanges();
            },
            err => {
              const { message } = err;
              this.responseHandler(message, true);
            }
          );
        };
        file.readAsDataURL(event.target.files[0]);
      } else {
        this.responseHandler(ValidationMessages['MAX_FILE_SIZE'], true);
      }
    }
  }

  downloadDocument(path) {
    if (path) {
       window.location.href = this.documentPath +'/'+btoa(path);
    }
  }

  logOut() {
    this.appService.logOut();
  }

  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  removeDoc(folder, subFolder= '', index = '') {
    this.appService.loader('start');
    const docData = {};
    docData['folderName'] = folder;
    const resFolder = (subFolder) ?  this[subFolder][index]  : this[folder][0];
    docData['randomString'] = resFolder['randomString'];
    this.uploadDocsService
    .save('deleteDoc', docData)
    .subscribe(
      res => {
        (subFolder) ?  this.resetSubFolder(subFolder, index)  : this[folder] = [];
        this.uploadDocValid = res['message']['is_upload_docs_completed'];
        this.appService.loader('stop');
        this.ref.detectChanges();
      },
      err => {
        const { message } = err;
        this.responseHandler(message, true);
      }
    );
  }

  redirectTo(path) {
    this.router.navigate([findRouteURL(path)]);
  }

  addMoreUploadOption(from, type = null) {
    type && this.setAddMoreStatus(type, false);
    from.push([]);
  }

  selectedServicesLines( forms, serviceLines ) {
    const serviceLength = Object.keys(forms.serviceLines).length;
    this.selectedServices = [];
    for (const key in forms.serviceLines ) {
      if (forms.serviceLines.hasOwnProperty(key)) {
        for (const keys in serviceLines) {
          if (serviceLines[keys]['_id'] === key) {
            if (serviceLines[keys]['name'] !== 'Travel - Clinical' && serviceLines[keys]['name'] !== 'Travel - Non-Clinical') {
              this.selectedServices.push(serviceLines[keys]);
            }
            break;
          }
        }
      }
    }
  }

  pushServicesValue() {
    for ( let i = 0; i < this.selectedServices.length; i++) {
      this.letters.push([]);
    }
  }

  setAddMoreStatus(type, status) {
    switch (type) {
      case 'financial_statements': this.addMoreFinance = status;
        break;
      case 'insurance_certificate': this.addMoreInsurance = status;
        break;
    }
  }

  resetSubFolder(subFolder, index) {
    if (subFolder === 'letters') {
      this[subFolder][index] = {};
    } else {
      this[subFolder].splice(index, 1);
    }
    if (this[subFolder].length === 0) {
      this[subFolder].push([]);
    }
    this.setAddMoreStatus(subFolder, this[subFolder][0].length === 0 ? false : true);
  }

  setApplicationState() {
    const { applicationStatus, isUploadDocsCompleted } = this.applicationService.get('filledForms');
    this.applicationStatus = applicationStatus;
    this.uploadDocValid = isUploadDocsCompleted;
    this.isExistingAgency = this.applicationService.get('isExistingAgency');
    this.showActionBtn = this.role === 'user' && this.applicationStatus !== 'pending';
    this.hasTJCID = this.applicationService.hasTJCID();
  }
}
