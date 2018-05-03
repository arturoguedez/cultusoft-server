import { expect } from 'chai';
import * as sinon from 'sinon';
import { BigQueryService } from './bigQueryService';
import * as BigQuery from '@google-cloud/bigquery';

describe('services/bigQueryService', () => {

    let sandbox;

    beforeEach('prepare sandbox', () => {
        sandbox = sinon.sandbox.create();
    });

    afterEach('restore sandbox', () => {
        sandbox.restore()
    });

    describe('createDateSet()', () => {
        it('fails', (done) => {
            let datasetId = 'sample';

            sandbox.stub(BigQuery.prototype, 'createDataset').callsFake(() => {
                return Promise.reject('There was an error');
            });

            new BigQueryService().createDateSet(datasetId)
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            let datasetId = 'sample';
            sandbox.stub(BigQuery.prototype, 'createDataset').callsFake(() => {
                return Promise.resolve();
            });

            new BigQueryService().createDateSet(datasetId)
                .then(() => {
                    done();
                });
        });
    });

    describe('listDatasets()', () => {
        it('fails', (done) => {
            sandbox.stub(BigQuery.prototype, 'getDatasets').callsFake(() => {
                return Promise.reject('There was an error');
            });

            new BigQueryService().listDatasets()
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'getDatasets').callsFake(() => {
                return Promise.resolve([[{ id: 'dataset_1' }, { id: 'dataset_2' }]]);
            });

            new BigQueryService().listDatasets()
                .then((datasets) => {
                    expect(datasets.length).to.be.equal(2);
                    expect(datasets[0]).to.be.equals('dataset_1');
                    expect(datasets[1]).to.be.equals('dataset_2');
                    done();
                });
        });
    });

    describe('insert()', () => {
        it('fails to find project', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            insert: (rows, options) => {
                                return Promise.reject({
                                    ApiError: 'Not found: Project the-fake-project-id',
                                    code: 404,
                                    errors:
                                        [{
                                            message: 'Not found: Project fake-project-id',
                                            domain: 'global',
                                            reason: 'notFound'
                                        }],
                                    response: undefined,
                                    message: 'Not found: Project fake-project-id'
                                });
                            }
                        }
                    }
                };

            });

            let datasetId = 'datasetid'
            let tableId = 'tableid';
            let rows = [{ Name: 'the_name' }];
            let options = null;
            new BigQueryService().insert(datasetId, tableId, rows, options)
                .catch((err) => {
                    expect(err.ApiError).to.be.equals('Not found: Project the-fake-project-id');
                    done();
                });
        });

        it('fails to find dataset', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            insert: (rows, options) => {
                                return Promise.reject({
                                    ApiError: 'Not found: Dataset the-fake-project-id:datasetid',
                                    code: 404,
                                    errors:
                                        [{
                                            message: 'Not found: Dataset the-fake-project-id:datasetid',
                                            domain: 'global',
                                            reason: 'notFound'
                                        }],
                                    response: undefined,
                                    message: 'Not found: Dataset the-fake-project-id:datasetid'
                                });
                            }
                        }
                    }
                };

            });

            let datasetId = 'datasetid'
            let tableId = 'tableid';
            let rows = [{ Name: 'the_name' }];
            let options = {};
            new BigQueryService().insert(datasetId, tableId, rows, options)
                .catch((err) => {
                    expect(err.ApiError).to.be.equals('Not found: Dataset the-fake-project-id:datasetid');
                    done();
                });
        });

        it('fails to insert into table', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            insert: (rows, options) => {
                                return Promise.reject({
                                    "errors": [{
                                        "errors": [{
                                            "message": "no such field.",
                                            "reason": "invalid"
                                        }],
                                        "row": {
                                            "Name": "the_name"
                                        }
                                    }],
                                    "response": {
                                        "kind": "bigquery#tableDataInsertAllResponse",
                                        "insertErrors": [{
                                            "index": 0,
                                            "errors": [{
                                                "reason": "invalid",
                                                "location": "name",
                                                "debugInfo": "",
                                                "message": "no such field."
                                            }]
                                        }]
                                    },
                                    "message": "A failure occurred during this request.",
                                    name: "PartialFailureError"
                                });
                            }
                        }
                    }
                };

            });

            let datasetId = 'testdatasetid'
            let tableId = 'testtable';
            let rows = [{ Name: 'the_name' }];
            let options = {};
            new BigQueryService().insert(datasetId, tableId, rows, options)
                .catch((err) => {
                    expect(err.message).to.be.equals('A failure occurred during this request.');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            insert: (rows, options) => {
                                return Promise.resolve([]);
                            }
                        }
                    }
                };
            });


            let datasetId = 'testdatasetid'
            let tableId = 'testtable';
            let rows = [{ Name: 'the_name' }];
            let options = {};
            new BigQueryService().insert(datasetId, tableId, rows, options)
                .then(() => {
                    done();
                });
        });
    });

    describe('deleteDataset()', () => {
        it('fails', (done) => {
            let datasetId = 'sample';
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    delete: (datasetId) => Promise.reject('There was an error')
                }
            });

            new BigQueryService().deleteDataset(datasetId)
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            let datasetId = 'sample';
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    delete: (datasetId) => Promise.resolve(),
                    id: 'the_id'
                }
            });

            new BigQueryService().deleteDataset(datasetId)
                .then(() => {
                    done();
                });
        });
    });

    describe('createTable()', () => {
        it('fails', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    createTable: (tableId, options) => Promise.reject('There was an error')
                }
            });

            new BigQueryService().createTable('dataset_id', 'table_id', 'schema')
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    createTable: (tableId, options) => Promise.resolve(['the result'])
                }
            });

            new BigQueryService().createTable('dataset_id', 'table_id', 'schema')
                .then((result) => {
                    expect(result).to.be.equals('the result');
                    done();
                });
        });
    });

    describe('setTableMetaData()', () => {
        it('fails', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            setMetadata: (metadata) => {
                                return Promise.reject('There was an error');
                            }
                        }
                    }
                }
            });

            new BigQueryService().setTableMetaData('dataset_id', 'table_id', 'schema', 'name', 'description')
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            setMetadata: (metadata) => {
                                return Promise.resolve(['the result']);
                            }
                        }
                    }
                }
            });

            new BigQueryService().setTableMetaData('dataset_id', 'table_id', 'schema', 'name', 'description')
                .then((result) => {
                    expect(result).to.be.equals('the result');
                    done();
                });
        });
    });

    describe('getRows()', () => {
        it('fails', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            getRows: (metadata) => {
                                return Promise.reject('There was an error');
                            }
                        }
                    }
                };
            });

            new BigQueryService().getRows('dataset_id', 'table_id')
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            getRows: (metadata) => {
                                return Promise.resolve(['the result']);
                            }
                        }
                    }
                };
            });

            new BigQueryService().getRows('dataset_id', 'table_id')
                .then((result) => {
                    expect(result).to.be.equals('the result');
                    done();
                });
        });
    });

    describe('listTables()', () => {
        it('fails', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    getTables: () => {
                        return Promise.reject('There was an error');
                    }
                };
            });

            new BigQueryService().listTables('dataset_id')
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    getTables: () => {
                        return Promise.resolve([[{ id: 'table_id' }, { id: 'table_id_2' }]]);
                    }
                };
            });

            new BigQueryService().listTables('dataset_id')
                .then((result) => {
                    expect(result.length).to.be.equals(2);
                    expect(result[0]).to.be.equals('table_id');
                    expect(result[1]).to.be.equals('table_id_2');
                    done();
                });
        });
    });

    describe('deleteTable()', () => {
        it('fails', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            delete: () => {
                                return Promise.reject('There was an error');
                            }
                        }
                    }
                };
            });

            new BigQueryService().deleteTable('dataset_id', 'table_id')
                .catch((err) => {
                    expect(err).to.be.equals('There was an error');
                    done();
                });
        });

        it('succeeds', (done) => {
            sandbox.stub(BigQuery.prototype, 'dataset').callsFake(() => {
                return {
                    table: (tableId) => {
                        return {
                            delete: () => {
                                return Promise.resolve();
                            }
                        }
                    }
                };
            });

            new BigQueryService().deleteTable('dataset_id', 'table_id')
                .then((result) => {
                    done();
                });
        });
    });
});
