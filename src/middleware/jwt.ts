'use strict';
import { Auth } from '../controllers/organization/auth';

export class JtwVertification {
    private auth;

    public constructor(auth: Auth) {
        this.auth = auth;
    }

    public setup() {
        let self = this;
        return function(req, res, next) {
            console.log("validating from the middleware");
            return self.auth.authenticate((err, user, info) => {
                if (err) { return next(err); }
                if (!user) {

                    if (info.name === "TokenExpiredError") {
                        return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
                    } else {
                        return res.status(401).json({ message: 'what' + info.message });
                    }
                }

                console.log("here is the user I got..");
                console.log(user);
                req.context = { user: user };
                return next();
            })(req, res, next);
        }
    }

}

export default JtwVertification;
