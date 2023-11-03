import { Inject, Injectable } from '@angular/core';
import { Contact, IContact } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable()
export class ContactsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getContacts() {
    return new Promise<Array<IContact>>(async (resolve, reject) => {
      try {
        const contacts = await this.database.getContacts();
        resolve(contacts);
      } catch (error) {
        reject(error);
      }
    });
  }

  getContact(id: string) {
    return new Promise<IContact | null>(async (resolve, reject) => {
      try {
        const contact = await this.database.getContact(id);
        if (contact) {
          resolve(contact);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  postContact(contact: Omit<IContact, 'id' | 'score'>): Promise<void> {
    return this.database.postContact(new Contact(contact));
  }

  putContact(contact: IContact): Promise<void> {
    return this.database.putContact(contact);
  }

  deleteContact(contact: IContact): Promise<void> {
    return this.database.deleteContact(contact.id);
  }
}
