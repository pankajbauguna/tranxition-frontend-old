import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APIUrls } from '../../shared/constants';
import { ApplicationService } from './application.service';
import { UserService } from './user.service';

@Injectable()
export class FormsService {
  store = new EventEmitter<any>();
  private data: any;
  constructor(
    private http: HttpClient,
    private applicationService: ApplicationService,
    private userService: UserService
  ) {
    this.applicationService.store.subscribe(
      res => {
        const { forms } = res;
        if (!!forms) {
          this.store.next(forms); // Update all forms Service subscriber
        }
      }
    );
  }

  get() {
    const forms = this.applicationService.get('forms');
    if (!forms) {
      return false;
    }
    const rawFormData = JSON.stringify(forms);
    const parsedData = JSON.parse(rawFormData);
    if (!parsedData) {
      return {
        staffingSpecialties: [],
        serviceLines: []
      };
    }
    const { staffingSpecialties, serviceLines } = parsedData;
    if (staffingSpecialties) {
      parsedData.staffingSpecialties = this.formatSpecialities(staffingSpecialties);
    }
    if (serviceLines) {
      parsedData.serviceLines = this.formatServices(serviceLines);
    }
    return !!parsedData && parsedData;
  }

  save(data) {
    const { staffingSpecialties, serviceLines } = data;
    data.staffingSpecialties = this.reduceSpecialities(staffingSpecialties);
    data.serviceLines = this.reduceServices(serviceLines);

    return this.applicationService
      .save('forms', data)
      .map(
        res => {
          this.applicationService.set('forms', data); // Update application data
          return res;
        }
      );
  }

  forceDispatch() {
    this.applicationService.forceDispatch();
  }

  reduceSpecialities(data) {
    return data.reduce(
      (accumulator, currentValue) => {
        const { key } = currentValue;
        if (currentValue.hasOwnProperty(key) && currentValue[key]) {
          accumulator.push(key);
        }
        return accumulator;
      },
      []
    );
  }

  reduceServices(data) {
    return data.reduce(
      (accumulator, currentValue) => {
        const { key, participatingEntities } = currentValue;
        if (currentValue.hasOwnProperty(key) && currentValue[key]) {
          accumulator.push({
            _id: key,
            participatingEntities: participatingEntities
          });
        }
        return accumulator;
      },
      []
    );
  }

  formatSpecialities(data) {
    return data.reduce(
      (accumulator, currentValue) => {
        if (currentValue) {
          accumulator[currentValue] = { [currentValue]: true };
        }
        return accumulator;
      },
      {}
    );
  }

  formatServices(data) {
    return data.reduce(
      (accumulator, currentValue) => {
        if (currentValue) {
          const { _id, participatingEntities } = currentValue;
          accumulator[_id] = { [_id]: true, participatingEntities };
        }
        return accumulator;
      },
      {}
    );
  }
}

