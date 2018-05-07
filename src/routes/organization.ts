import * as express from 'express';
import { Auth } from '../controllers/organization/auth';
import User from '../controllers/organization/user';
import JtwVertification from '../middleware/jwt';
import AuthorizationMiddleware from '../middleware/AuthorizationMiddleware';
import { Passport } from '../middleware/passport';

class Organization {
    public readonly router;
    private readonly auth: Auth;
    private readonly authenticatePrivate;
    constructor() {
        this.auth = new Auth(new Passport());
        this.authenticatePrivate = [new JtwVertification(this.auth).setup(), new AuthorizationMiddleware().setup()];

        this.router = express.Router();
        this.mountRoutes();
    }

    private mountRoutes(): void {
        this.router.get('/', (req, res) => {
            res.json({
                message: 'in the organizations'
            });
        });


        this.router.post('/auth/login/', this.auth.login);

        console.log("what is going on ");

        this.router.get('/user/info/', this.authenticatePrivate, User.info);
    }

}
export default new Organization().router;
