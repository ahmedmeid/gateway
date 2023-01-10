import { Point } from 'geojson';
import { IVehicle } from './vehicle.model';
export interface IVehicleData {
  fuelLevel: number;
  speed: number;
  location: Point;
  refVehicle: IVehicle;
}
