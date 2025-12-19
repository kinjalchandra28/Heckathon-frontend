import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UuidGenerator {
  getUuid(): string {
    const shortId = uuidv4().replace(/-/g, '').slice(0, 8);
    return `$${shortId}`;
  }
}
