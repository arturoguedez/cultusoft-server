'use strict';
import { expect } from 'chai';
import { BigQueryService } from '../services/bigQueryService';
import MigrationApplier from './migrationApplier';
import MigrationUpHandler from './migrationUpHandler';
import MigrationDownHandler from './migrationDownHandler';
import MigrationFactory from './migrationFactory';
import sinon = require('sinon');

describe('data/migrationApplier', function() {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('applyMigrations()', () => {
        it('No pending migrations left to apply', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let datasetId = 'testdataset';
            let pendingMigrations = [];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .then(() => {
                    done()
                });
        });

        it('Failing to create migration from Factory', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.reject('Unable to list tables');
            });

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                console.log("I got called");
                return Promise.reject('Unknown migration type');
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Unknown migration type');
                    done()
                });
        });

        it.only('Up failed, Down succeeded', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.reject('Unable to list tables');
            });

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                console.log("I got called");
                return Promise.resolve('Unknown migration type');
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                console.log("I got called");
                return Promise.reject('Unknown migration type');
            });

            sandbox.stub(MigrationDownHandler.prototype, 'handleDown').callsFake(() => {
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Unknown migration type');
                    done()
                });
        });
    });
});
