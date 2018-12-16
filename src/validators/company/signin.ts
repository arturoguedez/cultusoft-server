import * as validator from 'validator';
import { ValidatorAbstract } from '../validator';

export class Signin extends ValidatorAbstract {

  public validateFields(request, response, next) {
    const [email, password] = this.getFields(request, ['email', 'password']);

    if (!email || validator.isEmpty(email)) {
      return this.error(request, response, 'signin.email_required');
    }

    if (!validator.isEmail(email)) {
      return this.error(request, response, 'signin.invalid_email_format');
    }

    if (!validator.isLength(email, { max: 100 })) {
      return this.error(request, response, 'signin.invalid_email_length', { maxLength: '100' });
    }

    if (!password) {
      return this.error(request, response, 'signin.password_required');
    }

    if (!validator.isLength(password, { max: 100 })) {
      return this.error(request, response, 'signin.invalid_password_length', { maxLength: '100' });
    }

    next();
  }

}
