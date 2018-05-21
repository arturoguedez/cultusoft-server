import { Company } from '../../entity/company';
import { CompanyUser } from '../../entity/companyUser';
import { Role } from '../../entity/role';
import JwtUtils from '../../utils/jwt';

import { getManager, EntityManager, In } from "typeorm";
import * as bcrypt from 'bcrypt';
import * as i18n from 'i18n';

export class Signup {

  private async validateRequest(body) {
    if (!body.companyName) {
      return Promise.reject({ phrase: 'signup.company_named_required' });
    }

    if (!body.email) {
      return Promise.reject({ phrase: 'signup.email_required' });
    }

    if (!body.password) {
      return Promise.reject({ phrase: 'signup.password_required' });
    }

    return Promise.resolve();
  }

  // https://coderwall.com/p/1pn7cg/correct-way-to-store-passwords-in-node-js
  private async createCompany(body) {
    const { companyName, email, password } = body;

    let manager = await getManager();

    let company = await manager.findOne(Company, {
      where: {
        name: companyName
      }
    });

    if (company) {
      return Promise.reject({ phrase: 'signup.company_exists' });
    }

    let companyUser = await manager.findOne(CompanyUser, {
      where: {
        email: email
      }
    });

    if (companyUser) {
      return Promise.reject({ phrase: 'signup.user_exists', replace: { email: email } });
    }

    company = new Company();
    company.name = companyName;

    await manager.save(company);

    companyUser = new CompanyUser();
    companyUser.email = email;
    companyUser.company = company;

    let hashedPassword = await bcrypt.hash(password, 10);
    companyUser.password = hashedPassword;

    await manager.save(companyUser);

    let toReturn: any = {};
    toReturn = companyUser;
    let jwtData = JwtUtils.genToken({ username: email, userId: companyUser.id, roles: ['company_user'] });
    toReturn.jwt = jwtData;
    delete toReturn.password;
    return Promise.resolve(toReturn);
  }


  public create = async (req, res) => {
    try {
      await this.validateRequest(req.body);
      let data = await this.createCompany(req.body);
      return res.status(200).json({ responseCode: 200, data: data });
    } catch (err) {
      if (err && err.phrase) {
        return res.status(200).json({ responseCode: 500, errorMessage: i18n.__({ phrase: err.phrase, locale: i18n.getLocale(req) }, err.replace ? err.replace : {}) });
      }
      return res.status(200).json({ responseCode: 500, errorMessage: err });
    }
  }
}

export default Signup;
