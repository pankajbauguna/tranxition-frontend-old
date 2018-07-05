import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { APIUrls } from '../../shared/constants';
import { ApplicationService } from './application.service';


@Injectable()
export class UploadDocsService {
  store = new EventEmitter<any>();
  private data: any;
  constructor(
    private http: HttpClient,
    private applicationService: ApplicationService
  ) {
    this.applicationService.store.subscribe(
      res => {
        const { uploadDocs } = res;
        if (!!uploadDocs) {
          this.store.next(uploadDocs); // Update all UploadDocs Service subscriber
        }
      }
    );
  }

  get(isForcedDispatch = false) {
    const uploadDocs = this.applicationService.get('uploadDocs', isForcedDispatch);
    return !!uploadDocs && uploadDocs;
  }

  save(tag, data) {
    return this.applicationService
      .save(tag, data)
      .map(
        res => {
          this.applicationService.set('is_upload_docs_completed', res['message']['is_upload_docs_completed']); // Update application data
          return res;
        }
      );
  }

  replaceDocs(applicationId,docs) {
    const { REVIEW_DOC_APPLICATION } = APIUrls;
    return this.http
      .post(REVIEW_DOC_APPLICATION + applicationId + '/replaceUploadDocs',{'reviewDocs':docs})
      .map(
        res => {
          return res;
        }
      );
  }

}
