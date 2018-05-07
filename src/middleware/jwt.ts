'use strict';
import { Auth } from '../controllers/organization/auth';
import logger from '../utils/logger';

export class JtwVertification {
    private readonly auth: Auth;

    public constructor(auth: Auth) {
        this.auth = auth;
    }

    public setup() {
        const self = this;
        return (req, res, next) => {
            self.auth.authenticate((err, user, info) => {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    if (info.name === "TokenExpiredError") {
                        return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
                    } else {
                        return res.status(401).json({ message: info.message });
                    }
                }
                logger.debug("here is the user I got..");
                logger.debug(JSON.stringify(user));
                req.context = { user: user };
                return next();
            })(req, res, next);
        }
    }
}

export default JtwVertification;
