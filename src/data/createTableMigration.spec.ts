'use strict';
import { expect } from 'chai';
import { CreateTableMigration } from './createTableMigration';
import { BigQueryService } from '../services/bigQueryService';
import fs = require('fs');
import sinon = require('sinon');

describe('data/createTableMigration', function() {
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
            let migration = new CreateTableMigration('name', { schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done()
            });
        })

        it('missing schema', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new CreateTableMigration('name', { tableId: 'id' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done()
            });
        });

        it('resolving', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.createTable.restore();
            sandbox.stub(stub, "createTable").callsFake(() => {
                return Promise.resolve();
            });

            let migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.createTable.restore();
            sandbox.stub(stub, "createTable").callsFake(() => {
                return Promise.reject('error from stub');
            });

            let migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.up(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done()
            });
        });
    });

    describe('down()', function() {
        it('missing table id', function(done) {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new CreateTableMigration('name', { schema: 'schema' });
            migration.down(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done()
            });
        })

        it('missing schema', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            let migration = new CreateTableMigration('name', { tableId: 'id' });
            migration.down(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('Table id or schema not defined');
                done()
            });
        });

        it('resolving', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.deleteTable.restore();
            sandbox.stub(stub, "deleteTable").callsFake(() => {
                return Promise.resolve();
            });

            let migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').then(() => done());
        });

        it('rejected', (done) => {
            let stub = sandbox.createStubInstance(BigQueryService);
            stub.deleteTable.restore();
            sandbox.stub(stub, "deleteTable").callsFake(() => {
                return Promise.reject('error from stub');
            });

            let migration = new CreateTableMigration('name', { tableId: 'id', schema: 'schema' });
            migration.down(stub, 'datasetId').catch((err) => {
                expect(err).to.be.equal('error from stub');
                done()
            });
        });
    });
});
