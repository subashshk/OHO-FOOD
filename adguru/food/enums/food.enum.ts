export enum OrderStatus {
  Delivered = 'delivered',
  Pending = 'pending',
  Cancelled = 'canceled',
  Confirm = 'ready',
  Shipping = 'shipping',
  Received = 'received',
  Ready = 'ready'
}

export enum ProductStatus {
  New = 'new',
  Blocked = 'blocked',
  Active = 'active',
  Inactive = 'inactive',
  Denied = 'denied',
  Pending = 'pending',
  Verified = 'verified'
}

export enum RoutePath {
  Vendor = 'vendor',
  Category = 'categories'
}

export enum SalesType {
  Vendor = 'sales_by_vendor',
  Categories = 'sales_by_taxon',
  Product = 'sales_by_product'
}
