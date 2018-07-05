import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

// Import plugins
import { ToastrModule } from 'ngx-toastr';
import { CookieModule } from 'ngx-cookie';
import { ModalModule } from 'ngx-bootstrap/modal'


// Import custom modules
import { BootstrapModule } from './bootstrap';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';

// Import routes and services
import { routes } from './routes';

import { AppComponent } from './core/app.component';
import { AppService, AppInterceptor, StoreService, LoggedUserRoleResolver } from './shared';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BootstrapModule,
    RouterModule.forRoot(routes),
    CookieModule.forRoot(),
    CoreModule.forRoot(),
    AuthModule.forRoot(),
    ModalModule.forRoot(),
    ScrollToModule.forRoot(),
    ToastrModule.forRoot({
      preventDuplicates: true
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
    AppService,
    StoreService,
    LoggedUserRoleResolver,
    TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
