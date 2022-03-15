import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { endOfToday } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DateChangeService {

  public tomorrow = endOfToday().getTime();
  public todayExpired$ = new BehaviorSubject(false);;
  constructor() {
    setInterval(() => {
      if (Date.now() > this.tomorrow) {
        this.todayExpired$.next(true);
      }
    }, 2000);
  }
}
