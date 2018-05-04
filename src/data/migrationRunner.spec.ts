'use strict';
import { expect } from 'chai';
import { MigrationRunner } from './migrationRunner';
import { BigQueryService } from '../services/bigQueryService';
import MigrationApplier from './migrationApplier';
import PendingMigrationRetriever from './pendingMigrationRetriever';
import MigrationTableInitializer from './migrationTableInitializer';
import DatasetInitializer from './datasetInitializer';
import sinon = require('sinon');

describe('data/migrationRunner', function() {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('runMigrations()', () => {
        it('Unable to initialize DataSet.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.reject('Unable to initialize dataset');
            });

            let datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId).catch((err) => {
                expect(err).to.be.equal('Unable to initialize dataset');
                done();
            });
        });

        it('Unable to initialize Migrations Table', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.reject('Unable to initialize migration table');
            });

            let datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId).catch((err) => {
                expect(err).to.be.equal('Unable to initialize migration table');
                done();
            });
        });

        it('No Pending Migrations Found.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.resolve([]);
            });

            let datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .then(() => {
                    done();
                });
        });

        it('Unable to get Pending Migrations.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.reject('unable to get pending migrations');
            });

            let datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('unable to get pending migrations');
                    done();
                });
        });

        it('Applying Migration succeeds', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.resolve(['migration_1', 'migration_2']);
            });

            sandbox.stub(MigrationApplier.prototype, 'applyMigrations').callsFake(() => {
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .then(() => {
                    done();
                });
        });

        it('Applying Migration fails', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(DatasetInitializer.prototype, 'initDataset').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(MigrationTableInitializer.prototype, 'initMigrationTable').callsFake(() => {
                return Promise.resolve();
            });

            sandbox.stub(PendingMigrationRetriever.prototype, 'getPendingMigrations').callsFake(() => {
                return Promise.resolve(['migration_1', 'migration_2']);
            });

            sandbox.stub(MigrationApplier.prototype, 'applyMigrations').callsFake(() => {
                return Promise.reject('unable to apply migrations');
            });

            let datasetId = 'testdataset';
            new MigrationRunner(bigQueryServiceStub).runMigrations(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('unable to apply migrations');
                    done();
                });
        });
    });
});
