import * as express from 'express';
import Auth from '../controllers/organization/auth';
import User from '../controllers/organization/user';

class Organization {
    public readonly router;

    constructor() {
        this.router = express.Router();
        this.mountRoutes();
    }

    private mountRoutes(): void {
        this.router.get('/', (req, res) => {
            res.json({
                message: 'in the organizations'
            });
        });

        this.router.post('/auth/login/', Auth.login);

        this.router.use(function(req, res, next) {
            console.log('====');
            console.log(req.path);
            return Auth.authenticate((err, user, info) => {
                if (err) { return next(err); }
                if (!user) {
                    if (info.name === "TokenExpiredError") {
                        return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
                    } else {
                        return res.status(401).json({ message: info.message });
                    }
                }

                return next();
            })(req, res, next);
        });

        this.router.get('/user/info/', User.info);
    }

}
export default new Organization().router;
