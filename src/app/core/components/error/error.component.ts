import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../shared/app.service';
import { CONTACT_US_MAIL } from '../../../shared/constants';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  public contactUs = CONTACT_US_MAIL;
  constructor(
    private appService: AppService
  ) {}

  ngOnInit() {
    this.appService.loader('stop');
  }
}
