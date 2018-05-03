'use strict';
import { expect } from 'chai';
import { Migration } from './migration';
import { BigQueryService } from '../services/bigQueryService';
import sinon = require('sinon');

describe('data/migration', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    it('up()', (done) => {
        let stub = sandbox.createStubInstance(BigQueryService);
        let migration = new Migration('name');
        migration.up(stub, 'datasetId').then(() => done());
    });

    it('down()', (done) => {
        let stub = sandbox.createStubInstance(BigQueryService);
        let migration = new Migration('name');
        migration.down(stub, 'datasetId').then(() => done());
    });

    it('getName()', () => {
        let migration = new Migration('name');
        expect(migration.getName()).to.be.equals('name');
    });
});
