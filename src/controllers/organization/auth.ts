import * as jwt from "jwt-simple";
import * as passport from "passport";
import * as moment from "moment";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from '../../models/User';
import { UserInterface } from '../../models/UserInterface';
const config = require('config');

export class Auth {
    public constructor() {
        passport.use("jwt", this.getStrategy());
        passport.initialize();
    }

    public authenticate = (callback) => passport.authenticate("jwt", { session: false, failWithError: true }, callback);

    private genToken = (user: UserInterface): Object => {

        let expires = moment().utc().add({ days: 7 }).unix();
        let token = jwt.encode({
            exp: expires,
            username: user.username
        }, config.get('jwt').secret);

        return {
            token: "JWT " + token,
            expires: moment.unix(expires).format(),
            user: user.username
        };
    }

    public login = async (req, res) => {
        try {

            let user = await User.findAuthenticationInformation(req.body.username);

            if (user === null) throw "User not found";

            let success = await user.comparePassword(req.body.password);
            console.log("wast it a success?");
            console.log(success);
            if (success === false) throw "";

            res.status(200).json(this.genToken(user));
        } catch (err) {
            res.status(401).json({ "message": "Invalid credentials", "errors": err });
        }
    }

    private getStrategy = (): Strategy => {
        const params = {
            secretOrKey: config.get('jwt').secret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
            passReqToCallback: true
        };

        return new Strategy(params, (req, payload: any, done) => {
            User.findAuthenticationInformation(payload.username)
                .then(user => {
                    if (user === null) {
                        return done(null, false, { message: "The user in the token was not found" });
                    }

                    return done(null, { username: user.username, roles: user.roles });
                })
                .catch(err => {
                    return done(err);
                });
        });
    }
}

export default new Auth();
