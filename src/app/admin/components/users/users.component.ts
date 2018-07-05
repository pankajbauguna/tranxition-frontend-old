import { Component, OnInit, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { APP_LOGO, EXISTING_AGENCY_INFO, REVIEW, ValidationMessages } from '../../../shared/constants';
import { DashboardService } from '../../services/';
import { AuthService } from '../../../auth/services';
import { ValidationService, AppService  } from '../../../shared/';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {

  public serverResponse = false;
  public admins: any;
  public isServerResponse = false;
  public messages = ValidationMessages;
  public columns: Array<any> = [
    { title: 'Email', name: 'email' }
  ];
  public config: any = {
    paging: true,
    sorting: { columns: [] },
    sort: false,
    className: ['table-striped', 'table-bordered', 'applications-table']
  };
  public tableRows: Array<any>;
  public page: Number = 1;
  public itemsPerPage: Number = 10;
  public maxSize: Number = 5;
  public numPages: Number = 1;
  public length: Number = 0;
  public registerAdminForm: FormGroup;

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private appService: AppService,
    private titleCase: TitleCasePipe,
    private formbuilder: FormBuilder,
    private authService: AuthService
  ) {
    const { queryParams } = this.route;
    // set form group data for change password form
    this.registerAdminForm = formbuilder.group({
      email: [
        null,
        Validators.compose([Validators.required, ValidationService.validateEmailPattern])
      ],
      password: [
        null,
        Validators.compose([Validators.required, ValidationService.validatePasswordPattern])
      ],
      confirmPassword: [
        null,
        Validators.compose([Validators.required])
      ]
    }, { validator: ValidationService.matchPassword });
  }

  ngOnInit() {
    this.getAdminUsers();
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
      this.filterTable();
      url = [];
    } else {
      url = [REVIEW.URL];
    }
    this.router.navigate(url, navigationExtras);
  }

  /**
   * @description
   * Update Admin Data With Record
   */
  private updateAdmins(): void {
    return this.admins
      .reduce(
        (accumulator, currentValue) => {
          if (accumulator) {
            const { email } = currentValue;
            accumulator.push({
              email: `${email}`,
            });
          }
          return accumulator;
        },
        []
      );
  }

  /**
   * @description
   * Get Listing of Admin Users on load
   */
  private getAdminUsers() {
    this.appService.loader('start');
    this.authService
      .getAdminUsers()
      .subscribe(
        res => {
          this.admins = res;
          this.filterTable();
          this.isServerResponse = true;
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

  public changePage(page: any, data: Array<any> = this.admins): Array<any> {
    const start = (page.page - 1) * page.itemsPerPage;
    const end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public onChangeTable(config, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }) {
    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }
    const filteredData = this.updateAdmins();
    const sortedData = this.changeSort(filteredData, this.config);
    this.tableRows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.ref.detectChanges();
    this.length = sortedData.length;
  }

  /**
   * @description
   * Register Users for admin
   */
  registerAdminUser(value) {
    if (this.registerAdminForm.valid) {
      this.appService.loader('start');
      this.authService
        .registerAdminUser(value)
        .subscribe((res) => {
          this.registerAdminForm.reset();
          this.appService.loader('stop');
          const msgKey = 'message';
          const { [msgKey]: message } = res;
          this.responseHandler(message, false);
          this.getAdminUsers();
         },
        err => {
          const { message } = err;
          this.responseHandler(message, true);
        }
        );
    }
  }

  responseHandler(message, allowClose) {
    this.appService.loader('stop');
    this.appService.showToaster(allowClose, message);
    this.ref.detectChanges();
  }

  private filterTable() {
    this.onChangeTable(this.config);
  }
}
