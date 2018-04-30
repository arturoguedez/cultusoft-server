'use strict';
import { expect } from 'chai';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';
import { BigQueryService } from '../services/bigQueryService';
import fs = require('fs');
import sinon = require('sinon');

describe('data/setTableMetaDataMigration', function() {
    let sandbox;

    beforeEach('prepare sandbox', function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', function() {
        sandbox.restore();
    });

    describe('up()', function() {
        it('missing table id', function(done) {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new SetTableMetaDataMigration('name', { schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done()
            });
        });

        it('missing schema', function(done) {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new SetTableMetaDataMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done()
            });
        });

        it('resolving', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.setTableMetaData.restore();
            sandbox.stub(stub, "setTableMetaData").callsFake(() => {
                return Promise.resolve();
            });

            let migration = new SetTableMetaDataMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.setTableMetaData.restore();
            sandbox.stub(stub, "setTableMetaData").callsFake(() => {
                return Promise.reject('error from stub');
            });

            let migration = new SetTableMetaDataMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done()
            });
        });
    });

    // The Down function doesn't do anything by default. So it always resolves.
    describe('down()', function() {
        it('missing table id', function(done) {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new SetTableMetaDataMigration('name', { schema: 'schame' });
            migration.down(stub, 'datasetId').then(() => done());
        });

        it('resolving', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new SetTableMetaDataMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').then(() => done());
        });
    });
});
