'use strict';
import { expect } from 'chai';
import { BigQueryService } from '../services/bigQueryService';
import DatasetInitializer from './datasetInitializer';
import sinon = require('sinon');

describe('data/datasetInitializer', () => {
    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('initDataset()', () => {
        it('Unable to get list of datasets.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.reject('unable to get datasets');
            });

            let datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).catch((err) => {
                expect(err).to.be.equal('unable to get datasets');
                done();
            });
        });

        it('dataset does not exist. Creating it fails.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.resolve([]);
            });

            bigQueryServiceStub.createDateSet.restore();
            sandbox.stub(bigQueryServiceStub, 'createDateSet').callsFake(() => {
                return Promise.reject('Unable to create dataset');
            });

            let datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).catch((err) => {
                expect(err).to.be.equal('Unable to create dataset');
                done();
            });
        });

        it('Dataset does not exist. Creating it succeeds.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);

            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.resolve([]);
            });

            bigQueryServiceStub.createDateSet.restore();
            sandbox.stub(bigQueryServiceStub, 'createDateSet').callsFake(() => {
                return Promise.resolve();
            });

            let datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).then(() => {
                done();
            });
        });

        it('Dataset exists.', (done) => {
            let bigQueryServiceStub = sandbox.createStubInstance(BigQueryService);
            bigQueryServiceStub.listDatasets.restore();
            sandbox.stub(bigQueryServiceStub, 'listDatasets').callsFake(() => {
                return Promise.resolve(['other', 'testdataset']);
            });

            let datasetId = 'testdataset';
            new DatasetInitializer(bigQueryServiceStub).initDataset(datasetId).then(() => {
                done();
            });
        });
    });
});
