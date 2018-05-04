'use strict';
import { expect } from 'chai';
import { BigQueryService } from '../services/bigQueryService';
import MigrationApplier from './migrationApplier';
import { Migration } from './migration';
import MigrationUpHandler from './migrationUpHandler';
import MigrationDownHandler from './migrationDownHandler';
import MigrationFactory from './migrationFactory';
import sinon = require('sinon');

describe('data/migrationApplier', function() {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.createSandbox();
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

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
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

        it('Up failed, Down succeeded', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.resolve(new Migration('migration_name'));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                return Promise.reject('Unknown migration type');
            });

            sandbox.stub(MigrationDownHandler.prototype, 'handleDown').callsFake(() => {
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Migration migration_name has been rolled back. Error from up(): Unknown migration type');
                    done()
                });
        });

        it('Up failed, Down failed', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.resolve(new Migration('migration_name'));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                return Promise.reject('Unknown migration type');
            });

            sandbox.stub(MigrationDownHandler.prototype, 'handleDown').callsFake(() => {
                return Promise.reject('Down failed');
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(err).to.be.equals('Down failed');
                    done()
                });
        });

        it('Up succeded', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake(() => {
                return Promise.resolve(new Migration('migration_name'));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake(() => {
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .then(() => {
                    done()
                });
        });

        it('Up succeded many times', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let migrationOneApplied = 0;
            let migrationTwoApplied = 0;
            sandbox.stub(MigrationFactory.prototype, 'create').callsFake((name) => {
                return Promise.resolve(new Migration(name));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake((datasetId, migration) => {
                if (migration.getName() === 'migration_one') {
                    migrationOneApplied += 1;
                } else if (migration.getName() === 'migration_two') {
                    migrationTwoApplied += 1;
                }
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one', 'migration_two'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .then(() => {
                    expect(migrationOneApplied).to.be.equals(1);
                    expect(migrationTwoApplied).to.be.equals(1);
                    done()
                });
        });


        it('Up succeded many times, fails half way through', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            let migrationOneApplied = 0;
            let migrationTwoApplied = 0;
            let migrationThreeApplied = 0;

            let migrationOneReverted = 0;
            let migrationTwoReverted = 0;
            let migrationThreeReverted = 0;

            sandbox.stub(MigrationFactory.prototype, 'create').callsFake((name) => {
                return Promise.resolve(new Migration(name));
            });

            sandbox.stub(MigrationUpHandler.prototype, 'handleUp').callsFake((datasetId, migration) => {
                if (migration.getName() === 'migration_one') {
                    migrationOneApplied += 1;
                } else if (migration.getName() === 'migration_two') {
                    migrationTwoApplied += 1;
                    return Promise.reject('failed to complete');
                } else if (migration.getName() === 'migration_three') {
                    migrationTwoApplied += 1;
                }
                return Promise.resolve();
            });

            let downStub = sandbox.stub(MigrationDownHandler.prototype, 'handleDown');
            downStub.callsFake((datasetId, migration) => {
                if (migration.getName() === 'migration_one') {
                    migrationOneReverted += 1;
                } else if (migration.getName() === 'migration_two') {
                    migrationTwoReverted += 1;
                } else if (migration.getName() === 'migration_three') {
                    migrationThreeReverted += 1;
                }
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            let pendingMigrations = ['migration_one', 'migration_two', 'migration_three'];
            new MigrationApplier(bigQueryServiceStub, 'migration').applyMigrations(datasetId, pendingMigrations)
                .catch((err) => {
                    expect(migrationOneApplied).to.be.equals(1);
                    expect(migrationTwoApplied).to.be.equals(1);
                    expect(migrationThreeApplied).to.be.equals(0);

                    expect(migrationOneReverted).to.be.equals(0);
                    expect(migrationTwoReverted).to.be.equals(1);
                    expect(migrationThreeReverted).to.be.equals(0);
                    expect(err).to.be.equals('Migration migration_two has been rolled back. Error from up(): failed to complete');
                    done();
                });
        });
    });
});
