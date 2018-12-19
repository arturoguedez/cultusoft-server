// import { BigQueryService } from '../services/bigQueryService';
import * as uuidv4 from 'uuid/v4';


export class Company {
  // private bigQueryService: BigQueryService;
  private readonly tableName: string = 'company';

  constructor() {
    // this.bigQueryService = new BigQueryService();
  }

  public createCompany(companyName): Promise<ICompany> {
    let company: ICompany = {
      uuid: uuidv4(),
      name: companyName,
      created_at: new Date()
    }
    let rows = [{
      uuid: company.uuid,
      name: company.name,
      created_at: company.created_at
    }]
    return Promise.resolve(company);
    // return this.bigQueryService.insertDefault(this.tableName, rows)
    //   .then(() => {
    //     return Promise.resolve(company);
    //   })
    //   .catch((err) => {
    //     return Promise.reject(err);
    //   });
  }

  public doesCompanyExist(companyName: string): Promise<boolean> {
    return this.findByName(companyName)
      .then((company) => {
        console.log("what company did we find?");
        console.log(company);

        if (!company) {
          return Promise.resolve(false);
        }

        if (!company.uuid) {
          return Promise.resolve(false);
        } else {
          return Promise.resolve(true);
        }
      });
  }

  public findByName(name: string): Promise<ICompany> {
    const query =
      `
    SELECT uuid, name, created_at
    FROM ${this.tableName}
    WHERE name = @name
    ORDER BY created_at ASC
    LIMIT 1`;

    const options = {
      query,
      useLegacySql: false,
      params: {
        name: name
      }
    };
    return Promise.resolve(null);
    // return this.bigQueryService.queryDefault(options)
    //   .then((result) => {
    //     if (result && result[0]) {
    //       return Promise.resolve({ uuid: result[0].uuid, name: result[0].name, created_at: result[0].created_at });
    //     } else {
    //       return Promise.resolve(null);
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     throw "Unable to find company";
    //   });
  }

}

export interface ICompany {
  uuid: string;
  name: string;
  created_at: Date;
}

export default new Company();
