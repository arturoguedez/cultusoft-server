'use strict';
import { expect } from 'chai';
import { MigrationRegistry } from './migrationRegistry';
import fs = require('fs');
import sinon = require('sinon');

describe('data/migrationRegistry', function() {
    let sandbox;

    beforeEach('prepare sandbox', function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', function() {
        sandbox.restore();
    });

    it('getRegistry()', function() {
        let stubbedMigrations = ['migration_01.json', 'migration_02.json']
        let fsStub = sandbox.stub(fs, 'readdirSync');
        fsStub.withArgs(`${__dirname}/migrations/`).returns(stubbedMigrations);

        let registry = new MigrationRegistry().getRegistry();
        expect(2).to.eql(registry.length);
        expect(registry[0]).to.eql(stubbedMigrations[0]);
        expect(registry[1]).to.eql(stubbedMigrations[1]);
    });
});
