import { Inject, Injectable } from '@angular/core';
import { Contact, IContact } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getTags() {
    return new Promise<Array<string>>(async (resolve, reject) => {
      try {
        const tags = await this.database.getContactTags();
        resolve(tags ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  getContacts() {
    return new Promise<Array<IContact>>(async (resolve, reject) => {
      try {
        const contacts = await this.database.getContacts();
        resolve(contacts ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  getContact(contactId: string) {
    return new Promise<IContact>(async (resolve, reject) => {
      try {
        const contact = await this.database.getContact(contactId);
        if (contact) {
          resolve(contact);
        } else {
          throw new Error('Not exists');
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  postContact(contact: Omit<IContact, 'id'>): Promise<void> {
    return this.database.postContact(new Contact(contact));
  }

  putContact(contact: IContact): Promise<void> {
    return this.database.putContact({
      id: contact.id,
      accountId: contact.accountId,
      name: contact.name,
      surname: contact.surname,
      description: contact.description,
      rating: contact.rating,
      picture: contact.picture,
      phones: contact.phones,
      tags: contact.tags,
      created: Number(contact.created) || Date.now(),
      updated: Date.now()
    });
  }

  deleteContact(contact: IContact): Promise<void> {
    return this.database.deleteContact(contact.id);
  }
}
