import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './vehicle.reducer';

export const VehicleDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const vehicleEntity = useAppSelector(state => state.gateway.vehicle.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="vehicleDetailsHeading">
          <Translate contentKey="gatewayApp.customerManagementVehicle.detail.title">Vehicle</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{vehicleEntity.id}</dd>
          <dt>
            <span id="vehicleId">
              <Translate contentKey="gatewayApp.customerManagementVehicle.vehicleId">Vehicle Id</Translate>
            </span>
          </dt>
          <dd>{vehicleEntity.vehicleId}</dd>
          <dt>
            <span id="vehicleRegNo">
              <Translate contentKey="gatewayApp.customerManagementVehicle.vehicleRegNo">Vehicle Reg No</Translate>
            </span>
          </dt>
          <dd>{vehicleEntity.vehicleRegNo}</dd>
          <dt>
            <span id="deviceId">
              <Translate contentKey="gatewayApp.customerManagementVehicle.deviceId">Device Id</Translate>
            </span>
          </dt>
          <dd>{vehicleEntity.deviceId}</dd>
          <dt>
            <Translate contentKey="gatewayApp.customerManagementVehicle.owner">Owner</Translate>
          </dt>
          <dd>{vehicleEntity.owner ? vehicleEntity.owner.name : ''}</dd>
        </dl>
        <Button tag={Link} to="/vehicle" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/vehicle/${vehicleEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default VehicleDetail;
