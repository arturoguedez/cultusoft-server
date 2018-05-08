import config = require('config');
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import User from '../../models/User';
import { IUser } from '../../models/User';
import { IJWTConfig } from '../../utils/configs';

export class Auth {

    public login = async (req, res) => {
        try {
            const user = await User.findAuthenticationInformation(req.body.username);

            if (user === null) {
                throw new Error('User not found');
            }
            const success = await user.comparePassword(req.body.password);

            if (success === false) {
                throw new Error('Password mismatch');
            }

            res.status(200).json(this.genToken(user));
        } catch (e) {
            res.status(401).json({ message: 'Invalid credentials', errors: e.message });
        }
    }

    private genToken = (user: IUser): any => {
        const expires = moment().utc().add({ days: 7 }).unix();
        const token = jwt.encode({
            exp: expires,
            username: user.username
        }, config.get<IJWTConfig>('jwt').secret);

        return {
            expires: moment.unix(expires).format(),
            token: `JWT ${token}`,
            user: user.username
        };
    }
}

export default Auth;
