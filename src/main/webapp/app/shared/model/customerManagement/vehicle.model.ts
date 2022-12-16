import { ICustomer } from 'app/shared/model/customerManagement/customer.model';

export interface IVehicle {
  id?: number;
  vehicleId?: string;
  vehicleRegNo?: string;
  owner?: ICustomer;
}

export const defaultValue: Readonly<IVehicle> = {};
