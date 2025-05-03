import { inject, Injectable } from '@angular/core';
import { EcommerceProduct, IEcommerceProduct } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class EcommerceService {
  readonly #database = inject(DatabaseService);

  getTags = () => this.#database.getEcommerceTags();

  getProducts = () => this.#database.getEcommerceProducts();

  getProduct = (productId: string) => this.#database.getEcommerceProduct(productId);

  postProduct = (product: Omit<IEcommerceProduct, 'id' | 'created' | 'updated'>) =>
    this.#database.postEcommerceProduct(new EcommerceProduct(product));

  putProduct = (product: IEcommerceProduct) =>
    this.#database.putEcommerceProduct({
      id: product.id,
      accountId: product.accountId,
      accountEmail: product.accountEmail,
      productName: product.productName,
      contactName: product.contactName,
      price: product.price,
      description: product.description,
      pictures: product.pictures,
      phones: product.phones,
      tags: product.tags,
      created: Number(product.created) || Date.now(),
      updated: Date.now()
    });

  deleteProduct = (product: IEcommerceProduct) => this.#database.deleteEcommerceProduct(product.id);
}
