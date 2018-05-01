'use strict';
import { expect } from 'chai';
import { MigrationRunner } from './migrationRunner';
import { BigQueryService } from '../services/bigQueryService';
import MigrationRegistry from './migrationRegistry';
import MigrationApplier from './migrationApplier';
import PendingMigrationRetriever from './pendingMigrationRetriever';
import sinon = require('sinon');

describe('data/pendingMigrationRetriever', function() {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('getPendingMigrations()', () => {
        it('Empty Registry, Empty applied migrations.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
                return [];
            });

            bigQueryServiceStub.getRows.restore();
            sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
                return Promise.resolve([]);
            });

            let datasetId = 'testdataset';
            new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
                .then((rows) => {
                    expect(Array.isArray(rows)).to.be.true;
                    expect(rows.length).to.be.equal(0);
                    done();
                });
        });

        it('Pending migration found', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
                return ['migration_1'];
            });

            bigQueryServiceStub.getRows.restore();
            sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
                return Promise.resolve([]);
            });

            let datasetId = 'testdataset';
            new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
                .then((rows) => {
                    expect(Array.isArray(rows)).to.be.true;
                    expect(rows.length).to.be.equal(1);
                    expect(rows[0]).to.be.equal('migration_1');
                    done();
                });
        });

        it('Pending migrations found', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
                return ['migration_1', 'migration_2', 'migration_3'];
            });

            bigQueryServiceStub.getRows.restore();
            sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
                return Promise.resolve([{ Name: 'migration_1' }]);
            });

            let datasetId = 'testdataset';
            new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
                .then((rows) => {
                    expect(Array.isArray(rows)).to.be.true;
                    expect(rows.length).to.be.equal(2);
                    expect(rows[0]).to.be.equal('migration_2');
                    expect(rows[1]).to.be.equal('migration_3');
                    done();
                });
        });

        it('No pending migrations found', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
                return ['migration_1', 'migration_2', 'migration_3'];
            });

            bigQueryServiceStub.getRows.restore();
            sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
                return Promise.resolve([
                    { Name: 'migration_1' },
                    { Name: 'migration_2' },
                    { Name: 'migration_3' }
                ]);
            });

            let datasetId = 'testdataset';
            new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
                .then((rows) => {
                    expect(Array.isArray(rows)).to.be.true;
                    expect(rows.length).to.be.equal(0);
                    done();
                });
        });

        it('Unable to get rows', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationRegistry.prototype, 'getRegistry').callsFake(() => {
                return ['migration_1', 'migration_2', 'migration_3',];
            });

            bigQueryServiceStub.getRows.restore();
            sandbox.stub(bigQueryServiceStub, 'getRows').callsFake(() => {
                return Promise.reject('unable to get rows');
            });

            let datasetId = 'testdataset';
            new PendingMigrationRetriever(bigQueryServiceStub, 'table_name').getPendingMigrations(datasetId)
                .catch((err) => {
                    expect(err).to.be.equal('unable to get rows');
                    done();
                });
        });
    });
});
