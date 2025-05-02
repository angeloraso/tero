import { inject, Injectable } from '@angular/core';
import { Contact, IContact } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  readonly #database = inject(DatabaseService);

  getTags = () => this.#database.getContactTags();

  getContacts = () => this.#database.getContacts();

  getContact = (contactId: string) => this.#database.getContact(contactId);

  postContact = (contact: Omit<IContact, 'id' | 'created' | 'updated'>) => this.#database.postContact(new Contact(contact));

  putContact = (contact: IContact) =>
    this.#database.putContact({
      id: contact.id,
      accountId: contact.accountId,
      accountEmail: contact.accountEmail,
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

  deleteContact = (contact: IContact) => this.#database.deleteContact(contact.id);
}
