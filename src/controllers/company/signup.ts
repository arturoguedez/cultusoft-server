import { Company, CompanyUser } from '../../entity';
import { JwtUtils } from '../../utils';
import { Role } from '../../entity';

import { getManager, In, EntityManager } from "typeorm";
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

  private async findCompany(manager: EntityManager, companyName: string) {
    return manager.findOne(Company, {
      where: {
        name: companyName
      }
    });
  }

  private async findCompanyUser(manager: EntityManager, email: string) {
    return manager.findOne(CompanyUser, {
      where: {
        email: email
      }
    });;
  }
  private async createCompany(body) {
    const { companyName, email, password } = body;

    let manager = await getManager();
    let companyPromise = this.findCompany(manager, companyName);
    let companyUserPromise = this.findCompanyUser(manager, email);
    let rolesPomise = this.findRolesForNewCompanyUser(manager);
    let hashedPasswordPromise = bcrypt.hash(password, 10);

    let [company, companyUser, roles, hashedPassword] = await Promise.all([companyPromise, companyUserPromise, rolesPomise, hashedPasswordPromise]);

    if (company) {
      return Promise.reject({ phrase: 'signup.company_exists' });
    }

    if (companyUser) {
      return Promise.reject({ phrase: 'signup.user_exists', replace: { email: email } });
    }

    company = new Company();
    company.name = companyName;

    await manager.save(company);

    companyUser = new CompanyUser();
    companyUser.email = email;
    companyUser.company = company;
    companyUser.password = hashedPassword;
    companyUser.roles = roles;

    let roleNames = roles.map((role) => role.name);

    await manager.save(companyUser);

    let toReturn: any = {};
    toReturn = companyUser;
    let jwtData = new JwtUtils().genToken({ email: email, companyUserId: companyUser.id, roles: roleNames });
    toReturn.jwt = jwtData;
    delete toReturn.password;
    delete toReturn.roles;
    return Promise.resolve(toReturn);
  }

  private async findRolesForNewCompanyUser(manager: EntityManager) {
    let roles = await manager.find(Role, {
      where: {
        name: In(['company_user', 'company_manager'])
      }
    });

    return roles;
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
