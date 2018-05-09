import config = require('config');
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import User from '../models/User';
import { IJWTConfig } from '../utils/configs';
import logger from '../utils/logger';

export class Passport {

    public constructor() {
        passport.use('jwt', this.getStrategy());
        passport.initialize();
    }

    public authenticate(callback) {
        return passport.authenticate('jwt', { session: false, failWithError: true }, callback);
    }

    private getStrategy = (): Strategy => {
        const params = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
            passReqToCallback: true,
            secretOrKey: config.get<IJWTConfig>('jwt').secret
        };

        return new Strategy(params, (req, payload: any, done) => {
            User.findAuthenticationInformation(payload.username)
                .then((user) => {
                    if (user === null) {
                        return done(null, false, { message: 'The user in the token was not found' });
                    }
                    return done(null, { username: user.username, roles: user.roles });
                })
                .catch((err) => {
                    return done(err);
                });
        });
    }
}

export default Passport;
