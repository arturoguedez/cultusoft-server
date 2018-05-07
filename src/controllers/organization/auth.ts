import * as moment from "moment";
import User from '../../models/User';
import { UserInterface } from '../../models/UserInterface';
const config = require('config');
import { Passport } from '../../middleware/passport';
import * as jwt from "jwt-simple";

export class Auth {
    private passport: Passport;

    public constructor(passport: Passport) {
        this.passport = passport;
    }

    public authenticate(callback) {
        return this.passport.authenticate(callback);
    }

    public login = async (req, res) => {
        try {

            let user = await User.findAuthenticationInformation(req.body.username);

            if (user === null) {
                throw "User not found";
            }
            let success = await user.comparePassword(req.body.password);

            if (success === false) {
                throw "Passpord mismatch";
            }

            res.status(200).json(this.genToken(user));
        } catch (err) {
            res.status(401).json({ "message": "Invalid credentials", "errors": err });
        }
    }

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
}

export default Auth;
