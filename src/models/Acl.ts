import { BigQueryService } from '../services/bigQueryService';
import logger from '../utils/logger';
const config = require('config');

export class Acl {
    private bigQueryService: BigQueryService;

    constructor() {
        this.bigQueryService = new BigQueryService();
    }

    public findAll(): Promise<any> {
        let query = `SELECT * FROM acl`;

        return this.bigQueryService.query(config.get('google').bigQuery.dataSet, query)
            .then((result) => {
                let allowedList = result;
                let allow = [];
                allowedList.forEach((allowed) => {
                    allow.push({
                        roles: allowed.role,
                        allows: [{ resources: allowed.resource, permissions: allowed.permission }]
                    });
                })
                return Promise.resolve(allow);
            }
            );
    }
}

export default new Acl();
