'use strict';
import { expect } from 'chai';
import { InsertTableMigration } from './insertTableMigration';
import { BigQueryService } from '../services/bigQueryService';
import sinon = require('sinon');

describe('data/insertTableMigration', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('up()', () => {
        it('missing table id', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new InsertTableMigration('name', { rows: [] });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id is not defined');
                done()
            });
        })

        it('resolving', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.insert.restore();
            sandbox.stub(stub, "insert").callsFake(() => {
                return Promise.resolve();
            });

            let migration = new InsertTableMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.insert.restore();
            sandbox.stub(stub, "insert").callsFake(() => {
                return Promise.reject('error from stub');
            });

            let migration = new InsertTableMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done()
            });
        });
    });

    // The Down function doesn't do anything by default. So it always resolves.
    describe('down()', () => {
        it('missing table id', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new InsertTableMigration('name', { rows: [] });
            migration.down(stub, 'datasetId').then(() => done());
        });

        it('resolving', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new InsertTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').then(() => done());
        });
    });
});
