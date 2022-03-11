import { Injectable } from '@angular/core';
import { MESSAGES } from '../constants/messages';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  get(key: string, index?: number|string) {
      if (typeof index !== 'undefined') {
          return MESSAGES[key][index];
      }

      return MESSAGES[key];
  };

}
