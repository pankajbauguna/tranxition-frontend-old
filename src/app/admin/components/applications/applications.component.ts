import { Component, OnInit, ChangeDetectorRef, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { APP_LOGO, EXISTING_AGENCY_INFO, REVIEW } from '../../../shared/constants';
import { DashboardService } from '../../services/';
import { AppService } from '../../../shared/app.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnInit, AfterViewInit {

  public applications: any;
  public activeStatus = '';

  public columns: Array<any> = [
    { title: 'Company Name', name: 'name', filtering: { filterString: '', placeholder: 'Filter by name' } },
    { title: 'Refrence Number', name: 'referenceNumber', filtering: { filterString: '', placeholder: 'Filter by reference number' } },
    { title: 'Document Signed', name: 'documentSignedDate', filtering: {
      filterString: '', placeholder: 'Filter by document signed date'
    }},
    { title: 'Status', name: 'status', filtering: { filterString: '', placeholder: 'Filter by status' } }
  ];
  public config: any = {
    paging: true,
    sorting: { columns: this.columns },
    className: ['table-striped', 'table-bordered', 'applications-table']
  };
  public tableRows: Array<any>;
  public page: Number = 1;
  public itemsPerPage: any = 10;
  public maxSize: Number = 5;
  public numPages: Number = 1;
  public length: Number = 0;
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
    private elRef: ElementRef
  ) {
    const { queryParams } = this.route;
    this.activeStatus = !queryParams['status'] ? 'all' : queryParams['status'];

    this.route.data.subscribe(
      ({ applications }) => {
        this.applications = applications;
        this.filterTable('all');
      }
    );
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const lockNode = this.elRef.nativeElement.querySelector('ng-table');
    lockNode.onclick = (evt) => {
      const { target: { className, dataset }} = evt;
      if (className === 'lock') {
        this.appService.loader('start');
        this.dashboardService
          .removeApplicationReviewer(dataset['applicationId'])
          .subscribe(
            (res) => {
            this.applications
              .filter(application => application._id === dataset['applicationId'])
              .map((application) => {
                application.reviewUserEmail = null;
              });
            this.onChangeTable(this.config, { page: this.page, itemsPerPage: this.itemsPerPage });
            this.appService.loader('stop');
            this.ref.detectChanges();
          },
          (err) => {
            const { message } = err;
            this.responseHandler(message, false);
          }
        );
      }
    };
  }

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
      status !== 'all' ? this.filterTable(status) : this.getAllApplications(status);
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
   * Filter applications and fetch applications list if status is all
   * @param {String} status Apllications status
   */
  private filterApplications(status): void {
    this.applications = status !== 'all' ?
      this.dashboardService.filterApplicationsByStatus(status) : this.applications;

    return this.applications.reduce((accumulator, currentValue) => {
      if (accumulator) {
        const { company: { name }, state, _id, referenceNumber, reviewUserEmail, returnCount, documentSignedDate } = currentValue;
        const refNumber = referenceNumber ? referenceNumber : '';
        accumulator.push({
          name: `<span class="table-application-name">${name}</span><sup>${!!returnCount ? returnCount : ''}<sup>`,
          status: this.addCustomTemplateStatusCell(state, reviewUserEmail, _id),
          _id,
          referenceNumber: refNumber,
          islocked: !!reviewUserEmail,
          documentSignedDate
        });
      }
      return accumulator;
    }, []);
  }

  private getAllApplications(status) {
      this.appService.loader('start');
      this.dashboardService
        .fetchApplications({ status })
        .subscribe(
          res => {
            this.applications = res;
          this.filterTable('all');
            this.appService.loader('stop');
            this.ref.detectChanges();
          },
          err => {
            this.appService.loader('stop');
          }
        );
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
    const filteredApplicationsByStatus = this.filterApplications(this.activeStatus);
    const filteredData = this.changeFilter(filteredApplicationsByStatus, this.config);
    const sortedData = this.changeSort(filteredData, this.config);
    this.tableRows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;
    this.itemsPerPage = page.itemsPerPage === 'all' ? this.applications.length : page.itemsPerPage;
  }

  public onCellClick(evt) {
    const { column, row: { _id, islocked }} = evt;
    if (column === 'name') {
      this.redirectTo({ id: _id, status: null });
    }
  }

  public responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  private filterTable(status) {
    this.activeStatus = status;
    this.itemsPerPage = this.pagerLabel;
    this.onChangeTable(this.config);
  }
}
