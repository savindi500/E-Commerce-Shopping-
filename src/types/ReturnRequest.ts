export interface ReturnRequestModel {
  returnID?: number;
  orderID: number;
  productID: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  reason: string;
  productCondition: string;
  comment?: string;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
}

export interface ReturnFormData {
  orderNumber: string;
  productId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  orderDate: string;
  returnReason: string;
  otherReason: string;
  productCondition: string;
  additionalComments: string;
  photos: File[];
  termsAccepted: boolean;
}

export interface ReturnStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processing: number;
  completed: number;
}
