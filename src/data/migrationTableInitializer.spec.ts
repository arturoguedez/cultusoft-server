'use strict';
import { expect } from 'chai';
import { BigQueryService } from '../services/bigQueryService';
import MigrationTableInitializer from './migrationTableInitializer';
import sinon = require('sinon');

describe('data/migrationTableInitializer', function() {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('initMigrationTable()', () => {
        it('Unable to list tables.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.reject('Unable to list tables');
            });

            let datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('Unable to list tables');
                    done();
                });
        });

        it('Migration Table exists.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.resolve(['migration']);
            });
            let datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .then(() => {
                    done();
                });
        });

        it('Migration Table does not exists. Unable to create.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.resolve(['not_migration']);
            });

            bigQueryServiceStub.createTable.restore();
            sandbox.stub(bigQueryServiceStub, 'createTable').callsFake(() => {
                return Promise.reject('Unable to create table');
            });

            let datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('Unable to create table');
                    done();
                });
        });

        it('Migration Table does not exists. Creation succeeds.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listTables.restore();
            sandbox.stub(bigQueryServiceStub, 'listTables').callsFake(() => {
                return Promise.resolve(['migration']);
            });

            bigQueryServiceStub.createTable.restore();
            sandbox.stub(bigQueryServiceStub, 'createTable').callsFake(() => {
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            new MigrationTableInitializer(bigQueryServiceStub, 'migration').initMigrationTable(datasetId)
                .then(() => {
                    done();
                });
        });
    });
});
