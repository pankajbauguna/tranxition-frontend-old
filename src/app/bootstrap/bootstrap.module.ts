import { NgModule } from '@angular/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { PaginationModule } from 'ngx-bootstrap';

import {
  AlertModule,
  BsDatepickerModule,
  BsDropdownModule,
  PopoverModule
} from 'ngx-bootstrap';

@NgModule({
  imports: [
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    AngularFontAwesomeModule,
    Ng2TableModule,
    PaginationModule.forRoot()
  ],
  exports: [
    AlertModule,
    BsDatepickerModule,
    BsDropdownModule,
    PopoverModule,
    AngularFontAwesomeModule,
    Ng2TableModule,
    PaginationModule
  ],
})
export class BootstrapModule {}
