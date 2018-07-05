import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UploadDocsService } from '../services';

@Injectable()
export class UploadDocsResolver implements Resolve<any> {
  constructor(
    private uploadDocsService: UploadDocsService
  ) { }

  resolve(): Observable<any> {
    return Observable.of(this.uploadDocsService.get(true));
  }
}
