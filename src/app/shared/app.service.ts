import { Injectable} from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/services/auth.service';

@Injectable()
export class AppService {
  @BlockUI() blockUI: NgBlockUI;
  constructor(private toastr: ToastrService, private authService: AuthService) { 
  }
  // @description - method to set loader toggle information
  public loader = (action) => {
    (action === 'start') ? this.blockUI.start() : this.blockUI.stop();
  }

  public showToaster = (isError, message, isDisableTimeOut = false) => {
    if (isError) {
      this.toastr.error(message, 'Error', { disableTimeOut: isDisableTimeOut });
    } else {
      this.toastr.success(message, 'Success');
    }
  }

  public clearToaster = () => {
    this.toastr.clear();
  }

  public logOut = () => {
    this.loader('start');
    this.authService
      .logOut()
      .subscribe((res) => {
        this.loader('stop');
      },
      (err) => {
        this.loader('stop');
      });
  }
}
