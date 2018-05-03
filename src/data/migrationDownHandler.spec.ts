'use strict';
import { expect } from 'chai';
import { BigQueryService } from '../services/bigQueryService';
import { Migration } from './migration';
import MigrationDownHandler from './migrationDownHandler';
import sinon = require('sinon');

describe('data/migrationDownHandler', function() {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('handleDown()', () => {
        it('Successful', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let datasetId = 'testdataset';
            let migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.down.restore();
            sandbox.stub(migrationStub, 'down').callsFake(() => {
                return Promise.resolve();
            });

            new MigrationDownHandler(bigQueryServiceStub).handleDown(datasetId, migrationStub)
                .then(() => {
                    done()
                });
        });

        it('fails', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let datasetId = 'testdataset';
            let migrationStub = sandbox.createStubInstance(Migration);

            migrationStub.down.restore();
            sandbox.stub(migrationStub, 'down').callsFake(() => {
                return Promise.reject('There was an error');
            });

            migrationStub.getName.restore();
            sandbox.stub(migrationStub, 'getName').callsFake(() => {
                return 'migration_name';
            });

            new MigrationDownHandler(bigQueryServiceStub).handleDown(datasetId, migrationStub)
                .catch((err) => {
                    expect(err).to.be.equals(`Rollback failed for migration 'migration_name'. Error: "There was an error"`);
                    done()
                });
        });
    });
});
