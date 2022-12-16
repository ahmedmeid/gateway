export interface ICustomer {
  id?: number;
  name?: string;
  address?: string | null;
}

export const defaultValue: Readonly<ICustomer> = {};
