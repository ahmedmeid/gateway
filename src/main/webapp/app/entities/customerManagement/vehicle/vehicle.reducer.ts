import axios from 'axios';
import { createAsyncThunk, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';
import { IVehicle, defaultValue } from 'app/shared/model/customerManagement/vehicle.model';
import { ISubscription } from '../../../shared/model/customerManagement/subscription.model';

const initialState: EntityState<IVehicle> = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

const apiUrl = 'services/customermanagement/api/vehicles';

const vehicleDataApiUrl = 'services/vehicledata/api';

// Actions

export const getEntities = createAsyncThunk('vehicle/fetch_entity_list', async ({ page, size, sort }: IQueryParams) => {
  const requestUrl = `${apiUrl}?cacheBuster=${new Date().getTime()}`;
  return axios.get<IVehicle[]>(requestUrl);
});

export const getEntity = createAsyncThunk(
  'vehicle/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IVehicle>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const subscribeToVehicleData = createAsyncThunk(
  'vehicle/subscribe_vehicle_data',
  async (deviceId: string) => {
    const requestUrl = `${vehicleDataApiUrl}/subscribe?deviceId=${deviceId}`;
    return axios.post<ISubscription>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const createEntity = createAsyncThunk(
  'vehicle/create_entity',
  async (entity: IVehicle, thunkAPI) => {
    const result = await axios.post<IVehicle>(apiUrl, cleanEntity(entity));
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const updateEntity = createAsyncThunk(
  'vehicle/update_entity',
  async (entity: IVehicle, thunkAPI) => {
    const result = await axios.put<IVehicle>(`${apiUrl}/${entity.id}`, cleanEntity(entity));
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const partialUpdateEntity = createAsyncThunk(
  'vehicle/partial_update_entity',
  async (entity: IVehicle, thunkAPI) => {
    const result = await axios.patch<IVehicle>(`${apiUrl}/${entity.id}`, cleanEntity(entity));
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteEntity = createAsyncThunk(
  'vehicle/delete_entity',
  async (id: string | number, thunkAPI) => {
    const requestUrl = `${apiUrl}/${id}`;
    const result = await axios.delete<IVehicle>(requestUrl);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

// slice

export const VehicleSlice = createEntitySlice({
  name: 'vehicle',
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload.data;
      })
      .addCase(deleteEntity.fulfilled, state => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = {};
      })
      .addCase(subscribeToVehicleData.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = {
          ...state.entity,
          subscriptionId: action.payload.data.subscriptionId,
        };
      })
      .addMatcher(isFulfilled(getEntities), (state, action) => {
        const { data } = action.payload;

        return {
          ...state,
          loading: false,
          entities: data,
        };
      })
      .addMatcher(isFulfilled(createEntity, updateEntity, partialUpdateEntity), (state, action) => {
        state.updating = false;
        state.loading = false;
        state.updateSuccess = true;
        state.entity = action.payload.data;
      })
      .addMatcher(isPending(getEntities, getEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addMatcher(isPending(createEntity, updateEntity, partialUpdateEntity, deleteEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.updating = true;
      });
  },
});

export const { reset } = VehicleSlice.actions;

// Reducer
export default VehicleSlice.reducer;
