'use strict';
import { expect } from 'chai';
import { MigrationFactory } from './migrationFactory';
import { Migration } from './migration';
import { MigrationInterface } from './migrationInterface';
import { CreateTableMigration } from './createTableMigration';
import { InsertTableMigration } from './insertTableMigration';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';

import fs = require('fs');
import sinon = require('sinon');

describe('data/migratioFactory', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe('create()', () => {
        it('CreateTableMigration', (done) => {
            let stubbedMigrationContent = `{
              "type": "createTable"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').then((migration) => {
                expect(migration instanceof CreateTableMigration).to.be.true;
                done();
            });

        });

        it('InsertTableMigration', (done) => {
            let stubbedMigrationContent = `{
              "type": "insertTable"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').then((migration) => {
                expect(migration instanceof InsertTableMigration).to.be.true;
                done();
            });
        });

        it('SetTableMetaDataMigration', (done) => {
            let stubbedMigrationContent = `{
              "type": "setTableMetadDataMigration"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').then((migration) => {
                expect(migration instanceof SetTableMetaDataMigration).to.be.true;
                done();
            });
        });

        it('unknown type', (done) => {
            let stubbedMigrationContent = `{
              "type": "a_bad_one"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            new MigrationFactory().create('foo').catch((err) => {
                expect(err).to.be.equals('Unknown migration type a_bad_one');
                done();
            });
        });
    });
});
