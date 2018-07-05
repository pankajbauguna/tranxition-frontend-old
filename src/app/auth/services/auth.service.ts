import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { CookieService } from 'ngx-cookie';

import { APIUrls, USER, LOGIN, LOGGED_USER_INFO_ACTION, EXISTING_AGENCY_INFO, ADMIN_DASHBORAD } from '../../shared/constants';
import { Authenticate } from '../../shared/models';
import { StoreService } from '../../shared/store';

@Injectable()
export class AuthService {
  // Auth Subject to check the login session
  private authSubject = new BehaviorSubject(this.hasToken());
  private hasToken(): boolean {
    return !!this.cookie.get('token');
  }

  constructor(
    private store: StoreService,
    private cookie: CookieService,
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * @description
   * Store user information in browser cookie.
   * Seperate cookie keys is used to store token and other user information.
   *
   * @param {object} userInfo Response we get after login and email verification
   */
  private storeInCookie(userInfo) {
    const emailKey = 'email';
    const tokenKey = 'token';
    const roleKey = 'role';
    const isBelongToAgencyKey = 'isBelongToAgency';
    const { [emailKey]: email, [tokenKey]: token, [roleKey]: role  } = userInfo;
    this.cookie.put('token', token);
    this.cookie.put('user_info', JSON.stringify({ email, role, isBelongToAgencyKey }));
    this.store.dispatch({ type: LOGGED_USER_INFO_ACTION, payload: { role, email } });
  }

  /**
   * @description
   * Common redirect helper method to navigate route.
   * @param {string} path Url of requested route.
   */
  private redirectTo(path) {
    this.router.navigate([path]);
  }

  /**
   * @description
   * Login method which accepts user credential and return token.
   *
   * @param {object} credential Credentail is of Authenticate type must contain email and password.
   * @returns {observable<Token>} Token type Observable.
   */
  login(credential) {
    const { USER_LOGIN } = APIUrls;
    return this.http
      .post(USER_LOGIN, credential)
      .map(
        response => {
          this.storeInCookie(response);
          this.authSubject.next(true);
          if (response === 'admin') {
            this.redirectTo(ADMIN_DASHBORAD.URL);
          } else {
            this.redirectTo(EXISTING_AGENCY_INFO.URL);
          }
        }
      );
  }

  logOut() {
    const { USER_LOGOUT } = APIUrls;
    return this.http
      .post(USER_LOGOUT, {})
      .map(
        response => {
          this.cookie.removeAll({ path: '/' });
          this.authSubject.next(false);
          this.redirectTo(LOGIN.URL);
          return of(true);
        }
      );
  }

  loginAfterEmailVerification(response) {
    this.storeInCookie(response);
    this.authSubject.next(true);
    this.redirectTo(USER.URL);
  }

  registerUser({ email, password, agency_code }: Authenticate) {
    const { REGISTER_USER } = APIUrls;
    return this.http
      .post(REGISTER_USER, { email, password, agency_code });
  }

  registerAdminUser({ email, password }: Authenticate) {
    const { REGISTER_ADMIN_USER } = APIUrls;
    return this.http
      .post(REGISTER_ADMIN_USER, { email, password });
  }

  getAdminUsers() {
    const { GET_ADMIN_USER } = APIUrls;
    return this.http
      .get(GET_ADMIN_USER);
  }

  reSendEmail(email) {
    const { RESEND_EMAIL } = APIUrls;
    return this.http
      .post(RESEND_EMAIL, { email : email });
  }

  getAgencyDetailFromCode(code) {
    const { GET_AGENCY_DETAIL } = APIUrls;
    return this.http
    .get(GET_AGENCY_DETAIL + '/' + code);
  }

  forgotPassword({ email }: Authenticate) {
    const { FORGOT_PASSWORD } = APIUrls;
    return this.http
      .post(FORGOT_PASSWORD, { email });
  }

  resetPassword({ reset_password_key, password }: Authenticate) {
    const { RESET_PASSWORD } = APIUrls;
    return this.http
      .post(RESET_PASSWORD, { reset_password_key, password });
  }

  checkResetPasswordToken(reset_password_key) {
    const { CHECK_PASSWORD_TOKEN } = APIUrls;
    return this.http
      .post(CHECK_PASSWORD_TOKEN, reset_password_key)
      .catch(err => of({ err }));
  }

  checkVerificationLink(verification_key, is_email_verification) {
    const { EMAIL_VERIFICATION_LINK, USERNAME_VERIFICATION_LINK } = APIUrls;
    let url, params;
    if (is_email_verification) {
      url = EMAIL_VERIFICATION_LINK;
      params = { email_verification_key: verification_key };
    } else {
      url = USERNAME_VERIFICATION_LINK;
      params = { change_username_request_key: verification_key };
    }
    return this.http.post(url, params);
  }

  isLoggedIn(): Observable<boolean> {
    const { email, role } = this.getUserInfo();
    if (email && role) {
      this.store.dispatch({ type: LOGGED_USER_INFO_ACTION, payload: { role, email } });
    }
    return this.authSubject.asObservable();
  }

  getUserInfo() {
    const userInfo = this.cookie.get('user_info');
    return userInfo ? JSON.parse(userInfo) : {};
  }

  getToken() {
    return this.cookie.get('token');
  }

  isAdmin() {
    const { role } = this.getUserInfo();
    return role === 'admin';
  }
}
