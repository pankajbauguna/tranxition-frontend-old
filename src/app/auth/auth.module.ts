import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ROUTES } from '@angular/router/src/router_config_loader';
import { ReactiveFormsModule } from '@angular/forms';

import { BootstrapModule } from '../bootstrap';
import {
  LoginFormComponent,
  RegisterFormComponent,
  ForgotPasswordFormComponent,
  ResetPasswordFormComponent,
  UserVerificationFormComponent
} from './components';

import { AuthService, AuthGuard, AnonymousGuardService } from './services';
import { VerificationResolver, ResetPasswordResolver } from './resolver';
import {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  EMAIL_VERIFICATION,
  USER_VERIFICATION
} from '../shared/constants';
import { EMAIL_VALIDATOR } from '@angular/forms/src/directives/validators';

export const COMPONENTS = [
  LoginFormComponent,
  RegisterFormComponent,
  ForgotPasswordFormComponent,
  ResetPasswordFormComponent,
  UserVerificationFormComponent
];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, BootstrapModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RootAuthModule,
      providers: [AuthGuard, AnonymousGuardService, AuthService, VerificationResolver, ResetPasswordResolver],
    };
  }
}

@NgModule({
  imports: [
    AuthModule,
    RouterModule.forChild([
      {
        path: LOGIN.NAME,
        component: LoginFormComponent,
        canActivate: [AnonymousGuardService]
      },
      {
        path: REGISTER.NAME,
        component: RegisterFormComponent,
        canActivate: [AnonymousGuardService]
      },
      {
        path: FORGOT_PASSWORD.NAME,
        component: ForgotPasswordFormComponent,
        canActivate: [AnonymousGuardService]
      },
      {
        path: RESET_PASSWORD.NAME,
        component: ResetPasswordFormComponent,
        canActivate: [AnonymousGuardService],
        resolve: {
          reset: ResetPasswordResolver
        }
      },
      {
        path: EMAIL_VERIFICATION.NAME,
        component: UserVerificationFormComponent,
        resolve: {
          verification: VerificationResolver
        }
      },
      {
        path: USER_VERIFICATION.NAME,
        component: UserVerificationFormComponent,
        resolve: {
          verification: VerificationResolver
        }
      }
    ])
  ],
})
export class RootAuthModule {}
