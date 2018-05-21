import { Company } from '../../entity/company';
import { CompanyUser } from '../../entity/companyUser';
import { getConnection, getRepository, getManager } from "typeorm";


export class Signup {

  // private readonly companyModel;
  constructor() {
    console.log("I got called");
    // this.companyModel = new Company();
  }

  // Bring in typeorm to handle all the database things!

  //http://typeorm.io/#/
  private async createCompany(data) {
    console.log("got body:");
    console.log(data);
    if (!data.companyName) {
      return Promise.reject('companyName is required');
    }

    const companyName = data.companyName;
    const email = data.email;
    const password = data.password;

    try {
      let connection = await getConnection();
      let manager = await getManager();
      const xcompany = await connection
        .createQueryBuilder()
        .select()
        .from(Company, "company")
        .where("company.name = :name", { name: companyName })
        .getRawOne();
      // .getOne();

      let companyRepository = await getRepository(Company);

      let company = await companyRepository
        .createQueryBuilder("company")
        .where("company.name = :name", { name: companyName })
        .getOne();
      // .getOne();

      let companyY = await manager.findOne(Company, {
        where: {
          name: companyName
        }
      });

      // .getOne();

      console.log("what was found aeh");
      console.log(company);
      console.log('vs');
      console.log(xcompany);
      console.log('company ...y ....!12345678');
      console.log(companyY);

      if (!company) {
        console.log("the company odes not exist");
        company = new Company();
        company.name = companyName;

        await manager.save(company);

        let companyUser = new CompanyUser();
        companyUser.email = email;
        companyUser.password = password;
        companyUser.company = company;

        await manager.save(companyUser);
      } else {
        console.log("the company does exist! tell them it's there");


      }
      // let doesCompanyExist = await this.companyModel.doesCompanyExist(companyName);
      // console.log("Does the company exist?");
      // console.log(doesCompanyExist);
      // if (!doesCompanyExist) {
      //   let companyCreated = await this.companyModel.createCompany(companyName);
      //   console.log("company created?");
      //   console.log(companyCreated);
      //
      // }

      return Promise.resolve();

    } catch (err) {
      return Promise.reject(err);
    };

  }

  public create = async (req, res) => {

    this.createCompany(req.body)
      .then(() => {
        return res.status(200).json({ responseCode: 200, errorMessage: "none" });
      })
      .catch((err) => {
        return res.status(200).json({ responseCode: 500, errorMessage: err });
      });
  }
}

export default Signup;
