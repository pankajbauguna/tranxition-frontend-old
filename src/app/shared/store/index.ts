import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class StoreService {
  private initialState = {};
  state = new BehaviorSubject({ type: '', payload: this.initialState });

  constructor() {}

  dispatch(action) {
    const { type, payload } = action;
    this.initialState[type] = { ...this.initialState[type], ...payload };
    setTimeout(() => this.state.next({ ...action, payload: this.initialState[type] }), 100);
  }

  getState(key) {
    return this.initialState[key];
  }
}
