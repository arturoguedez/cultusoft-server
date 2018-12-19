import config = require('config');
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import { IJWTConfig } from './configs';

export class JwtUtils {

  public genToken = (toEncode: any): any => {
    const expires = moment().utc().add({ days: 7 }).unix();

    toEncode.exp = expires;
    const token = jwt.encode(toEncode, config.get<IJWTConfig>('jwt').secret);

    return {
      expires: moment.unix(expires).format(),
      token: `JWT ${token}`
    };
  }
}
