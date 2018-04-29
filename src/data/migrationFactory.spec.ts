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

describe('data/migratioFactory', function() {
    let sandbox;

    beforeEach('prepare sandbox', function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', function() {
        sandbox.restore();
    });

    describe('create()', function() {
        it('CreateTableMigration', function() {
            let stubbedMigrationContent = `{
              "type": "createTable"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            let migration = new MigrationFactory().create('foo');
            expect(migration instanceof CreateTableMigration).to.be.true;
        });
        it('InsertTableMigration', function() {
            let stubbedMigrationContent = `{
              "type": "insertTable"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            let migration = new MigrationFactory().create('foo');
            expect(migration instanceof InsertTableMigration).to.be.true;
        });

        it('SetTableMetaDataMigration', function() {
            let stubbedMigrationContent = `{
              "type": "setTableMetadDataMigration"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            let migration = new MigrationFactory().create('foo');
            expect(migration instanceof SetTableMetaDataMigration).to.be.true;
        });

        it('unknown type', function() {
            let stubbedMigrationContent = `{
              "type": "a_bad_one"
            }`;
            let fsStub = sandbox.stub(fs, 'readFileSync');
            fsStub.onCall(0).returns(stubbedMigrationContent);

            expect(new MigrationFactory().create('foo')).to.throw(Error, 'Unknown migration type a_bad_one');
        });

    });
});
