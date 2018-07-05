import { Component, OnInit, ChangeDetectorRef, TemplateRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { APP_LOGO, EXISTING_AGENCY_INFO, REVIEW, APPLICATION_RESET_ACTION } from '../../../shared/constants';
import { DashboardService } from '../../services/';
import { AppService } from '../../../shared/app.service';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-application-reset',
  templateUrl: './application-reset.component.html',
  styleUrls: ['./application-reset.component.scss'],
})
export class ApplicationResetComponent implements OnInit {

  public serverResponse = false;
  public applications: any;
  public activeStatus = '';
  public isServerResponse = false;
  public confirmationModalRef: BsModalRef;
  public captchaModalRef: BsModalRef;
  public resetApplicationId;
  public resetApplicationAction;
  public resetActionLabel = '';
  public bounds = {
    lower: 5,
    upper: 50
  };
  public first = 0;
  public second =  0;
  public isWrongAnswer = false;

  public columns: Array<any> = [
    { title: 'Agency Name', name: 'name', filtering: { filterString: '', placeholder: 'Filter by name' } },
    { title: 'Refrence Number', name: 'referenceNumber', filtering: { filterString: '', placeholder: 'Filter by reference number' } },
    { title: 'Document Signed', name: 'documentSignedDate', filtering: {
      filterString: '',
      placeholder: 'Filter by document signed date'
    }},
    { title: 'Status', name: 'status', filtering: { filterString: '', placeholder: 'Filter by status' } },
    { title: '', name: 'level0', className: 'hide-border'},
    { title: 'Action', name: 'level1', className: 'hide-border'},
    { title: '', name: 'level2'}
  ];
  public config: any = {
    paging: true,
    sorting: { columns: [] },
    sort: false,
    className: ['table-striped', 'table-bordered', 'applications-table']
  };
  public tableRows: Array<any>;
  public page: Number = 1;
  public itemsPerPage: any = 10;
  public maxSize: Number = 5;
  public numPages: Number = 1;
  public length: Number = 0;
  public applicationResetForm: FormGroup;

  public pagerOptions = [
    { itemsPerPage: 10 },
    { itemsPerPage: 25 },
    { itemsPerPage: 50 },
    { itemsPerPage: 'all' }
  ];
  public pagerLabel = this.itemsPerPage;

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private appService: AppService,
    private titleCase: TitleCasePipe,
    private formbuilder: FormBuilder,
    private modalService: BsModalService,
    private elRef: ElementRef
  ) {
    const { queryParams } = this.route;
    // set form group data for change password form
    this.applicationResetForm = formbuilder.group({
      agencyName: [null, Validators.required],
      calCulatedValue: [null]
    });
  }

  ngOnInit() {}

  /**
   * @description
   * Redirect to application
   * @param {String} status Application status
   */
  private redirectTo({ id, status }) {
    let url;
    const navigationExtras: NavigationExtras = {
      relativeTo: this.route,
      queryParams: { id, status }
    };
    if (status) {
      this.filterTable();
      url = [];
    } else {
      url = [REVIEW.URL];
    }
    this.router.navigate(url, navigationExtras);
  }

  /**
   * @description
   * Add custom template for status column as per application status
   * @param {String} status Status value
   */
  private addCustomTemplateStatusCell(status, reviewUserEmail, id) {
    let iconName;
    const lock = !!reviewUserEmail ? 'lock' : '';

    switch (status) {
      case 'pending':
        iconName = 'ellipsis-h';
        break;
      case 'approved':
        iconName = 'check';
        break;
      case 'rejected':
        iconName = 'mail-reply';
        break;
      case 'returned':
        iconName = 'redo-alt';
        break;
      case 'submitting':
        iconName = 'spinner';
        break;
    }

    return (
      `<div class="custom-icon ${iconName} ${status}">
        <span>${this.titleCase.transform(status)}<span>
        ${ lock ?
        `<span class="application-reviewer">${reviewUserEmail}<span class="${lock}" data-application-id="${id}"></span></span>` : ''
        }
      </div`);
  }

  /**
   * @description
   * Generate to get random number
   */
  private generateCaptcha() {
    this.first = Math.floor(Math.random() * this.bounds.lower) + 1;
    this.second = Math.floor(Math.random() * this.bounds.upper) + 1;
  }

  /**
   * @description
   * Solve Captcha
  */
  private solveCaptcha() {
    const sum = this.first + this.second;
    const calCulatedValue = this.applicationResetForm.value['calCulatedValue'];
    if (sum === Number(calCulatedValue)) {
      this.resetApplication();
    } else {
      this.isWrongAnswer = true;
    }
  }

  /**
   * @description
   * Add custom template for status column as per application status
   * @param {String} applicationId applicationId value
   */
  private addCustomButtonTemplateStatusCell(action) {
    return (`<button class="btn btn-primary" type="button">${action}</button>`);
  }

  levelHandler(evt) {
    console.log(evt);
  }

  /**
   * @description
   * Update Application Data With Action Button
   */
  private updateApplications(): void {
    return this.applications
      .reduce(
        (accumulator, currentValue) => {
          if (accumulator) {
            const { company: { name }, state, _id, referenceNumber, reviewUserEmail, returnCount, documentSignedDate } = currentValue;
            const levels = {
              level0: this.addCustomButtonTemplateStatusCell(APPLICATION_RESET_ACTION.level0.label),
              level1: this.addCustomButtonTemplateStatusCell(APPLICATION_RESET_ACTION.level1.label),
              level2: this.addCustomButtonTemplateStatusCell(APPLICATION_RESET_ACTION.level2.label)
            };
            const refNumber = referenceNumber ? referenceNumber : '';
            accumulator.push({
              name: `<span class="table-application-name">${name}</span><sup>${!!returnCount ? returnCount : ''}<sup>`,
              status: this.addCustomTemplateStatusCell(state, reviewUserEmail, _id),
              _id,
              referenceNumber: refNumber,
              islocked: !!reviewUserEmail,
              documentSignedDate,
              ...levels
            });
          }
          return accumulator;
        },
        []
      );
  }

  public searchApplication(value) {
    if (this.applicationResetForm.valid) {
      this.appService.loader('start');
      this.dashboardService
        .searchApplications(value)
        .subscribe(
          res => {
            this.applications = res;
            this.filterTable();
            this.isServerResponse = true;
            this.appService.loader('stop');
            this.ref.detectChanges();
            const lockNode = this.elRef.nativeElement.querySelector('ng-table');
            lockNode.onclick = (evt) => {
              const { target: { className, dataset } } = evt;
              if (className === 'lock') {
                this.dashboardService
                  .removeApplicationReviewer(dataset['applicationId'])
                  .subscribe(() => {
                    this.applications
                      .filter(application => application._id === dataset['applicationId'])
                      .map((application) => {
                        application.reviewUserEmail = null;
                      });
                    this.onChangeTable(this.config, { page: this.page });
                    this.ref.detectChanges();
                  });
              }
            };
          },
          err => {
            this.appService.loader('stop');
          }
        );
      }
  }

  public changeSort(data: any, config: any): any {
    if (!config.sorting) {
      return data;
    }

    const columns = this.config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous: any, current: any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  public changePage(page: any, data: Array<any> = this.applications): Array<any> {
    const start = (page.page - 1) * page.itemsPerPage;
    const end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    this.page = page.page;
    return data.slice(start, end);
  }

  public changeFilter(data: any, config: any): any {
    let filteredData: Array<any> = data;
    this.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => {
          const regex = new RegExp(column.filtering.filterString, 'i');
          return item[column.name].match(regex);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      const regex = new RegExp(this.config.filtering.filterString, 'i');
      return filteredData.filter((item: any) =>
        item[config.filtering.columnName].match(regex));
    }

    const tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.columns.forEach((column: any) => {
        const regex = new RegExp(this.config.filtering.filterString, 'i');
        if (item[column.name].toString().match(regex)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onChangeTable(config, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }, isPagerCall = false) {
    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }
    // this.pagerLabel = page.itemsPerPage === 'all' ? 'All' : page.itemsPerPage;
    const filteredApplicationsByStatus = this.updateApplications();
    const filteredData = this.changeFilter(filteredApplicationsByStatus, this.config);
    const sortedData = this.changeSort(filteredData, this.config);
    this.tableRows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;
    this.itemsPerPage = page.itemsPerPage === 'all' ? this.applications.length : page.itemsPerPage;
    this.ref.detectChanges();
  }

  openResetApplicationConfirmationModal(template: TemplateRef<any>) {
    this.confirmationModalRef = this.modalService.show(template, { class: 'modal-sm', backdrop: 'static' });
  }

  confirm(template: TemplateRef<any>): void {
    this.generateCaptcha();
    this.confirmationModalRef.hide();
    this.confirmationModalRef = null;
    this.applicationResetForm.patchValue({'calCulatedValue': null});
    this.captchaModalRef = this.modalService.show(template, { class: 'modal-sm', backdrop: 'static' });
  }

  /**
   * @description
   * Reset Application
   * @param {String} applicationId applicationId value
   * @param {String} action action value
   */
  resetApplication() {
    this.appService.loader('start');
    this.dashboardService
      .resetApplication(this.resetApplicationId, this.resetApplicationAction)
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
  }

  decline(): void {
    this.confirmationModalRef.hide();
  }

  declineCaptcha(): void {
    this.isWrongAnswer = false;
    this.captchaModalRef.hide();
  }

  public onCellClick(evt, template) {
    const { row: { _id, islocked }, column } = evt;

    if (APPLICATION_RESET_ACTION.hasOwnProperty(column)) {
      this.resetApplicationAction = APPLICATION_RESET_ACTION[column].value;
      this.resetActionLabel = APPLICATION_RESET_ACTION[column].label;
      this.resetApplicationId = _id;
      this.openResetApplicationConfirmationModal(template);
    }

    if (column === 'name') {
      this.redirectTo({ id: _id, status: null });
    }

    if (column === 'status' && islocked) {
      this.dashboardService
        .removeApplicationReviewer(_id)
        .subscribe(res => {
          this.applications
            .filter(application => application._id === _id)
            .map((application) => {
              application.reviewUserEmail = null;
            });
          this.onChangeTable(this.config);
        });
    }
  }

  responseHandler(message, allowClose) {
    this.declineCaptcha();
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  private filterTable() {
    this.itemsPerPage = this.pagerLabel;
    this.onChangeTable(this.config);
  }
}
