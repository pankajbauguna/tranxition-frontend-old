import { Injectable } from '@angular/core';
import { RegexPatterns } from './constants';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormArray } from '@angular/forms';

@Injectable()
export class ValidationService {

  constructor() { }

  // @description - method to validate the email pattern
  public static validateEmailPattern(email: any) {
    let toReturn = null;
    const { EMAIL_PATTERN } = RegexPatterns;
    if (!(( new RegExp(EMAIL_PATTERN)).test(email.value))) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }

  // @description - method to validate the password pattern
  public static validatePasswordPattern(password: any) {
    let toReturn = null;
    const { PASSWORD_PATTERN } = RegexPatterns;
    if (!(new RegExp(PASSWORD_PATTERN)).test(password.value)) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }

  // @description - method to validate the passwords match (new and confirm password)
  public static matchPassword(AC: AbstractControl) {
   const password = AC.get('password').value; // to get value in input tag
   const confirmPassword = AC.get('confirmPassword'); // to get value in input tag
   const toReturn = null;
    if (password !== confirmPassword.value) {
      confirmPassword.setErrors({ matchPassword: true });
    } else {
      return toReturn;
    }
  }

  // @description - method to validate the phone number length with digits
  public static validPhoneNumber(phone: any) {
    let toReturn = null;
    const { PHONE_PATTERN } = RegexPatterns;
    if (!((new RegExp(PHONE_PATTERN)).test(phone.value))) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }

    // @description - method to validate the phone number length with digits 0 length is valid
    public static emptyOrValidPhoneNumber(phone: any) {
      let toReturn = null;
      const { PHONE_PATTERN } = RegexPatterns;
      if (!((new RegExp(PHONE_PATTERN)).test(phone.value))
    && phone.value && phone.value.length >= 0
    ) {
        toReturn = { 'invalidFormat' : true };
      }
      return toReturn;
    }

  // @description - method to validate campaign/notification fields on form submission
  public static validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if ((control instanceof FormControl) || (control instanceof FormArray)) {
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  public static multipleCheckboxRequireOne() {
    return (formArray) => {
      const { value } = formArray;
      const filteredArr = value.filter(
        item => {
          const valueArr = Object.keys(item).map(key => item[key]);
          return valueArr.indexOf(true) !== -1;
        }
      );

      if (!(filteredArr.length > 0)) {
        return {
          multipleCheckboxRequireOne: true
        };
      }
      return null;
    };
  }

  public static isOtherSpecialtiesSelected(AC: AbstractControl) {
    let isError = false;
    const isOtherStaffingSpecialties = AC.get('isOtherStaffingSpecialties').value;
    if(isOtherStaffingSpecialties) {
      const otherStaffingSpecialties = AC.get('otherStaffingSpecialties').value;
      if(otherStaffingSpecialties && otherStaffingSpecialties.length>0) {
      } else {
        isError = true;
        AC.get('otherStaffingSpecialties').setErrors({ requireOtherStaffingSpecialties: true });
      }
    }
    if (!isError) {
      return null;
    }
  }

  public static multipleCheckboxRequireOneForServiceLines() {
    const checkBoxSelection = [], isParticipatingValidation = true;

    return (formArray) => {
      const { value } = formArray;
      const arr = value.filter(
        item => {
          const key  = item.key;

          if (item[key] && !item.participatingEntities) {
            item['err'] = {
              isParticipatingValidation: true
            };
            return true;
          }

          if (!item[key] && item.participatingEntities) {
            item['err'] = {
              multipleCheckboxRequireOne: true
            };
            return true;
          }

          if (!item[key] && !item.participatingEntities) {
            return false;
          }
        }
      );

      return (arr.length > 0) ? arr[0].err : null;
    };
  }

  // @description - method to validate agreements
  public static validateAggreement(AC: AbstractControl) {
    let isError = false;
    const hidden_name = AC.get('hidden_name').value;
    const valid_review_sign = AC.get('valid_review_sign').value;
    if (hidden_name != valid_review_sign) {
      AC.get('valid_review_sign').setErrors({ requireReviewSignSame: true });
      isError = true;
    }
    if (!isError) {
      return null;
    }
  }

  // @description - method to validate the federal tax id pattern
  public static validateTaxIdPattern(taxId: any) {
    let toReturn = null;
    const { FEDERAL_TAX_ID } = RegexPatterns;
    if (!(new RegExp(FEDERAL_TAX_ID)).test(taxId.value)) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }

  // @description validate join commition id
  public static validateJcIdPattern(jcId: any) {
    let toReturn = null;
    const { JC_ID_PATTERN } = RegexPatterns;
    if (!!jcId.value && !(new RegExp(JC_ID_PATTERN)).test(jcId.value)) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }


  public static validateDomainPattern(domain: any) {
    let toReturn = null;
    const { DOMAIN_PATTERN } = RegexPatterns;
    if (!!domain.value && !(new RegExp(DOMAIN_PATTERN)).test(domain.value)) {
      return { 'invalidFormat' : true };
    }
    return toReturn;
  }

  

  public static validateDomainOrUrlPattern(domain: any){
    let toReturn = null;
    const { DOMAIN_PATTERN, URL_PATTERN } = RegexPatterns;

    if (!!domain.value) {
      const domainInLowercase = domain.value.toLowerCase();
      if (!(new RegExp(DOMAIN_PATTERN)).test(domainInLowercase) && !(new RegExp(URL_PATTERN)).test(domainInLowercase)) {
        return { 'invalidFormat': true };
      }
    }

    return toReturn;
  }


  public static validateLinkedInPattern(domain: any) {
    let toReturn = null;
    const { LINKEDIN_PATTERN, DOMAIN_PATTERN, URL_PATTERN} = RegexPatterns;
    if (!!domain.value && 
       !(new RegExp(LINKEDIN_PATTERN,'i').test(domain.value))) {
      return { 'invalidFormat' : true };
    }
    return toReturn;
  }

  public static validateFacebookPattern(domain: any) {
    let toReturn = null;
    const { FACEBOOK_PATTERN } = RegexPatterns;
    if (!!domain.value && !(new RegExp(FACEBOOK_PATTERN,'i').test(domain.value))) {
      return { 'invalidFormat' : true }; 
    }
    return toReturn;
  }

  

  // @description - method to validate the url pattern
  public static validateURLPattern(url: any) {
    let toReturn = null;
    const { URL_PATTERN } = RegexPatterns;
    if (!!url.value && !(new RegExp(URL_PATTERN)).test(url.value)) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }

  // @description - method to validate the zipcode pattern
  public static validateNumeric(number: any) {
    let toReturn = null;
    const { NUMBER_PATTERN } = RegexPatterns;
    if (!(new RegExp(NUMBER_PATTERN)).test(number.value)) {
      toReturn = { 'invalidFormat' : true };
    }
    return toReturn;
  }

  /**
   * @description
   * Validate each zipcode field and get error message if zipcode is not valid.
   * @param {Object} number Abstract control of zipcode fields
   * @returns {Object}
   */
  public static isUSZipCode(number: any) {
    let toReturn = null;
    const { US_ZIP_CODE } = RegexPatterns;
    if (!(new RegExp(US_ZIP_CODE)).test(number.value)) {
      toReturn = { 'invalidFormat': true };
    }
    return toReturn;
  }

  public static isRealNumber(number: any) {
    let toReturn = null;
    const { FP_NUMBER_PATTERN, NUMBER_PATTERN } = RegexPatterns;
    if (!number.value) {
      return toReturn;
    }
    if (
      !(new RegExp(FP_NUMBER_PATTERN)).test(number.value) &&
      !(new RegExp(NUMBER_PATTERN)).test(number.value)
    ) {
      toReturn = { 'invalidFormat': true };
    }
    return toReturn;
  }

  /**
   * @description
   * Validate text only.
   * @param {Object} field Abstract control of fields
   * @returns {Object}
   */
  public static textAndSpacesOnly(field: any) {
    let toReturn = null;
    const { TEXT_AND_SPACES_PATTERN } = RegexPatterns;
    if (!(new RegExp(TEXT_AND_SPACES_PATTERN)).test(field.value)) {
      toReturn = { 'invalidFormat': true };
    }
    return toReturn;
  }

  /**
   * @description
   * Validate Date.
   * @param {Object} field Abstract control of fields
   * @returns {Object}
   */
  public static isDate(field: any) {
    let toReturn = null;
    const dateObj = new Date(field.value);
    if (field.value && dateObj instanceof Date && isNaN(dateObj.getTime())) {
      toReturn = { 'invalidDate': true };
    }
    return toReturn;
  }

  public static isValidExpirationDate(field: any) {
    let toReturn = null;
    const { parent, value } = field;
    if (parent && value) {
      const effectiveDateField = parent.get('effectiveDate');
      const expirationDate = new Date(value);
      const effectiveDate = new Date(effectiveDateField.value);
      const today = new Date();
      const expirationTime = expirationDate.getTime();

      if (expirationDate instanceof Date && isNaN(expirationTime)) {
        return null;
      }

      if (effectiveDate instanceof Date && isNaN(effectiveDate.getTime())) {
        return null;
      }

      if ((today.getTime() > expirationTime) || (expirationTime < effectiveDate.getTime())) {
        toReturn = { 'notFutureDate': true };
      }
    }
    return toReturn;
  }
}
