import config = require('config');
// import { BigQueryService } from '../services/bigQueryService';
import { IGoogleConfig } from '../utils/configs';
import logger from '../utils/logger';

export class Acl {
  // private bigQueryService: BigQueryService;

  constructor() {
    // this.bigQueryService = new BigQueryService();
  }

  public findAll(): Promise<any> {
    const query = `SELECT * FROM acl`;

    return Promise.resolve([]);
    // return this.bigQueryService.query(config.get<IGoogleConfig>('google').bigQuery.dataSet, query)
    //     .then((result) => {
    //         const allowedList = result;
    //         const allow = [];
    //         allowedList.forEach((allowed) => {
    //             allow.push({
    //                 allows: [{ resources: allowed.resource, permissions: allowed.permission }],
    //                 roles: allowed.role
    //             });
    //         });
    //         return Promise.resolve(allow);
    //     }
    //     );
  }
}

export default new Acl();
