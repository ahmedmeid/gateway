import { ICustomer } from 'app/shared/model/customerManagement/customer.model';

export interface IVehicle {
  id?: number;
  vehicleId?: string;
  vehicleRegNo?: string;
  deviceId?: string;
  owner?: ICustomer;
  subscriptionId?: string;
}

export const defaultValue: Readonly<IVehicle> = {};
