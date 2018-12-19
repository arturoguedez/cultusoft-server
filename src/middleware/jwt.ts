'use strict';
import { Auth } from '../controllers/organization/auth';
import { Passport } from '../middleware/passport';
import logger from '../utils/logger';

export class JtwVertification {
    private passport: Passport;

    public constructor(passport: Passport) {
        this.passport = passport;
    }

    public setup() {
        const self = this;
        return (req, res, next) => {
            logger.debug('in the jwt middleware');
            self.authenticate((err, user, info) => {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    if (info.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'Your token has expired. Please generate a new one' });
                    } else {
                        return res.status(401).json({ message: info.message });
                    }
                }
                logger.debug('here is the user I got..');
                logger.debug(JSON.stringify(user));
                req.context = { user };
                return next();
            })(req, res, next);
        };
    }

    private authenticate(callback) {
        return this.passport.authenticate(callback);
    }

}

export default JtwVertification;
