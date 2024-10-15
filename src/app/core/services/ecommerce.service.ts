import { Inject, Injectable } from '@angular/core';
import { EcommerceProduct, IEcommerceProduct } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getTags() {
    return new Promise<Array<string>>(async (resolve, reject) => {
      try {
        const tags = await this.database.getEcommerceTags();
        resolve(tags ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  getProducts() {
    return new Promise<Array<IEcommerceProduct>>(async (resolve, reject) => {
      try {
        const products = await this.database.getEcommerceProducts();
        resolve(products ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  getProduct(productId: string) {
    return this.database.getEcommerceProduct(productId);
  }

  postProduct(product: Omit<IEcommerceProduct, 'id' | 'created' | 'updated'>): Promise<void> {
    return this.database.postEcommerceProduct(new EcommerceProduct(product));
  }

  putProduct(product: IEcommerceProduct): Promise<void> {
    return this.database.putEcommerceProduct({
      id: product.id,
      accountId: product.accountId,
      name: product.name,
      price: product.price,
      description: product.description,
      pictures: product.pictures,
      phones: product.phones,
      tags: product.tags,
      created: Number(product.created) || Date.now(),
      updated: Date.now()
    });
  }

  deleteProduct(product: IEcommerceProduct): Promise<void> {
    return this.database.deleteEcommerceProduct(product.id);
  }
}
