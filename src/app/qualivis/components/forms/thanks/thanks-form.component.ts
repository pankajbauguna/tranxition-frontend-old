import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { ValidationService, AppService } from '../../../../shared';
import { ApplicationService, AgencyService } from '../../../services';
import { REVIEW, CHANGE_USERNAME } from '../../../../shared/constants';

@Component({
  selector: 'app-thanks-form',
  templateUrl: './thanks-form.component.html',
  styleUrls: ['./thanks-form.component.scss'],
})
export class ThanksFormComponent implements OnInit {

  public errorMsg = '';
  public successMsg = '';
  public back = '';
  public routes = {
    'change-username': CHANGE_USERNAME.URL
  };
  constructor(
    private appService: AppService,
    private applicationService: ApplicationService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private agencyService: AgencyService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) {
  }

  ngOnInit() {
    const { err, suc, back } = this.route.snapshot.queryParams;
    if (err) {
      this.errorMsg = atob(err);
    }

    if (suc) {
      this.successMsg = atob(suc);
    }

    if (back) {
      this.back = atob(back);
    }
  }

  redirectTo(): void {
    const { id } = this.route.snapshot.queryParams;
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };

    const url = this.back ? this.back : REVIEW.URL;
    this.router.navigate([url], id ? navigationExtras : {});
  }
}
