import * as jwt from "jwt-simple";
import * as passport from "passport";
import * as moment from "moment";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from '../models/User';
import config = require('config');
import logger from '../utils/logger';
import { IJWTConfig } from '../utils/configs';

export class Passport {

    public constructor() {
        passport.use('jwt', this.getStrategy());
        passport.initialize();
    }

    public authenticate(callback) {
        return passport.authenticate('jwt', { session: false, failWithError: true }, callback);
    };

    private getStrategy = (): Strategy => {
        const params = {
            secretOrKey: config.get<IJWTConfig>('jwt').secret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
            passReqToCallback: true
        };

        return new Strategy(params, (req, payload: any, done) => {
            User.findAuthenticationInformation(payload.username)
                .then(user => {
                    if (user === null) {
                        return done(null, false, { message: 'The user in the token was not found' });
                    }
                    return done(null, { username: user.username, roles: user.roles });
                })
                .catch(err => {
                    return done(err);
                });
        });
    }
}

export default Passport;
