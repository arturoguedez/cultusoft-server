import { Company, CompanyUser, Role } from '../../entity';
import { JwtUtils } from '../../utils';

import { getManager, EntityManager, In } from "typeorm";
import * as bcrypt from 'bcrypt';
import * as i18n from 'i18n';

export class Signin {
  private async findCompanyUser(manager: EntityManager, email: string) {
    return manager.findOne(CompanyUser, {
      where: {
        email: email
      },
      relations: ['roles']
    });;
  }

  private async authenticate(body) {
    const { email, password } = body;

    let manager: EntityManager = await getManager();
    let companyUser = await this.findCompanyUser(manager, email);

    if (!companyUser) {
      return Promise.reject({ phrase: 'signin.user_not_found', replace: { email: email } });
    }

    let passwordMatch = await bcrypt.compare(password, companyUser.password);
    if (!passwordMatch) {
      return Promise.reject({ phrase: 'signin.password_mismatch' });
    }

    let roleNames = companyUser.roles.map((role) => role.name);
    let toReturn: any = {};
    toReturn = companyUser;
    let jwtData = new JwtUtils().genToken({ email: email, companyUserId: companyUser.id, roles: roleNames });
    toReturn.jwt = jwtData;
    delete toReturn.password;
    delete toReturn.roles;
    return Promise.resolve(toReturn);
  }
  // // TODO:
  /*
  was thinking of a more generic response, like
    public signing = async (req, res) => {
      new Validator().validate(req, res)
      generateResponse(this.authenticate(req.body));
  
      
  
  }
  
  */
  public signin = async (req, res) => {
    console.log("updated2");
    try {
      let data = await this.authenticate(req.body);
      return res.status(200).json({ responseCode: 200, data: data });
    } catch (err) {
      if (err && err.phrase) {
        return res.status(200).json({ responseCode: 500, errorMessage: i18n.__({ phrase: err.phrase, locale: i18n.getLocale(req) }, err.replace ? err.replace : {}) });
      }
      if (err && err.message) {
        return res.status(200).json({ responseCode: 500, errorMessage: err.message });
      }
      return res.status(200).json({ responseCode: 500, errorMessage: err });

    }
  }
}

export default Signin;
