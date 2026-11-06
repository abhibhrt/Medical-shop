import type { Address, AddressInput, BaseEntity, UpdateAddressInput } from "./common.types";

/**
 * Core Shop database entity.
 */
export interface Shop extends BaseEntity {
  shop_name: string;
  phone: string;
  email: string;
  drug_licence_number: string;
  pharmacist_name: string;
  pharmacist_registration_number: string;
  gstin: string;
  owner_id: string;
  address_id: string;
  image_id: string | null;
}

/**
 * Shop details with joined Address relation.
 */
export interface ShopResponse extends Shop {
  address?: Address;
}

/**
 * Input payload for creating a new shop.
 */
export interface CreateShopInput {
  ownerId: string;
  shopName: string;
  phone: string;
  email: string;
  drugLicenceNumber: string;
  pharmacistName: string;
  pharmacistRegistrationNumber: string;
  gstin: string;
  address: AddressInput;
  imageId?: string | null;
}

/**
 * Input payload for updating an existing shop.
 */
export interface UpdateShopInput extends Partial<Omit<CreateShopInput, "ownerId" | "address">> {
  ownerId: string;
  address?: UpdateAddressInput;
}