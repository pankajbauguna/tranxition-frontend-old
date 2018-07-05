import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { BaseChartDirective } from 'ng2-charts/ng2-charts';

import {
  PIE_CHART_COLOR_CODES,
  EXISTING_AGENCY_INFO,
  REVIEW
} from '../../../shared/constants';
import { AppService } from '../../../shared';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) baseChart: BaseChartDirective;

  // Pie configuration
  public pieChartLabels: string[] = [];
  public pieChartData: number[] = [];
  public pieChartColor = [];
  public pieChartType = 'pie';
  public pieChartOptions = {
    tooltips: {
      custom: function (tooltip) {},
      callbacks: {
        label: function (tooltipItems, data) {
          const { labels, datasets } = data;
          const chartData = datasets[0].data;
          const total: number = chartData.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          }, 0);
          const value: number = chartData[tooltipItems.index];
          const per: number = value / total * 100;
          const roundPer = Math.round(per);
          return [roundPer, '%', ' or ', value, ' ', labels[tooltipItems.index]].join('');
        },
        beforeLabel: function (tooltipItems, data) {}
      }
    }
  };

  public applications: any = [];
  public activeStatus = 'all';

  public columns: Array<any> = [
    { title: 'Company Name', name: 'name', filtering: { filterString: '', placeholder: 'Filter by name' } },
    { title: 'Status', name: 'status', filtering: { filterString: '', placeholder: 'Filter by status' } },
    { title: 'Document Signed', name: 'documentSignedDate', filtering: { filterString: '', placeholder: 'Filter by document signed date' } }
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
    private appService: AppService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    this.route.data.subscribe(
      ({ adminData }) => {
        const { chart, applications } = adminData;
        this.renderChart(chart);
        this.applications = applications;
        this.onChangeTable(this.config);
      });
  }

  ngOnInit() {}

  /**
   * @description
   * Set all required attribute variable for charts for rendering.
   * @param {Array} applicationList Array of applications
   * @returns {Void}
   */
  renderChart(applicationList): void {
    const backgroundColor = [];
    applicationList.map(
      item => {
        const { state, count } = item;
        this.pieChartLabels.push(this.capitalizeFirstLetter(state));
        this.pieChartData.push(count);
        backgroundColor.push(PIE_CHART_COLOR_CODES[state]);
      }
    );

    this.pieChartColor = [{ backgroundColor: backgroundColor }];
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * @description
   * Fetch application by its status
   * @param {Object} query Query parameter
   * @returns {Void}
   */
  private getApplicationsByStatus(query): void {
    this.appService.loader('start');
    this.dashboardService
      .fetchApplications(query)
      .subscribe(
        (res: any) => {
          this.applications = res;
          this.appService.loader('stop');
          this.ref.detectChanges();
        },
        err => {
          this.appService.loader('stop');
        }
      );
  }

  /**
   * @description
   * Chart click event handler, get active chart point and call function to fetch application by status
   * @param {Object} evt Chart click event
   * @returns {Void}
   */
  chartClickAction(evt: any): void {
    const activePoints = evt.active;
    if (activePoints[0]) {
      const { _chart: { config: { data: { labels } }}, _index } = activePoints[0];

      const label = labels[_index];
      this.activeStatus = label.toLowerCase();
      this.onChangeTable(this.config);
    }
  }

  /**
   * @description
   * Redirect to application
   * @param {String} id Application id
   */
  redirectTo(id) {
    const navigationExtras: NavigationExtras = {
      queryParams: { 'id': id }
    };
    this.router.navigated = true;
    this.router.navigate([REVIEW.URL], navigationExtras);
  }

  private filterApplications(status) {
    this.applications = status !== 'all' ? this.dashboardService.filterApplicationsByStatus(this.activeStatus) : this.applications;
    return this.applications.reduce((accumulator, currentValue) => {
      if (accumulator) {
        const { company: { name }, state, _id, returnCount, documentSignedDate } = currentValue;
        accumulator.push({
          name: `<span class="table-application-name">${name}</span><sup>${!!returnCount ? returnCount : ''}<sup>`,
          status: state,
          _id,
          documentSignedDate
        });
      }
      return accumulator;
    }, []);
  }

  /**
   * @description
   * Fetch applications and update applications list and chart data
   */
  getAllApplications() {
    this.appService.loader('start');
    this.dashboardService
      .fetch()
      .subscribe(
        ({ chart, applications }) => {
          this.clearChartData();
          this.renderChart(chart);
          this.applications = applications;
          this.filterTable('all');
          this.appService.loader('stop');
          this.ref.detectChanges();
        },
        err => {
          this.appService.loader('stop');
        }
      );
  }

  /**
   * @description
   * Private method to clear all chart data
   */
  private clearChartData() {
    this.pieChartLabels = [];
    this.pieChartData = [];
    this.pieChartColor = [];
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
    if (evt.column === 'name') {
      const { row: { _id }} = evt;
      this.redirectTo(_id);
    }
  }

  private filterTable(status) {
    this.activeStatus = status;
    this.itemsPerPage = this.pagerLabel;
    this.onChangeTable(this.config);
  }
}
