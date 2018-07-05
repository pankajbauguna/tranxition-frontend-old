import { Component, NgModule, ChangeDetectionStrategy } from '@angular/core';
import { AppService } from '../shared/app.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private appService: AppService
  ) {
    this.appService.loader('start');
  }
}
