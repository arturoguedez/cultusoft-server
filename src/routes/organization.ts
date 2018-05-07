import * as express from 'express';
import { Auth } from '../controllers/organization/auth';
import User from '../controllers/organization/user';
import JtwVertification from '../middleware/jwt';
import AclMiddleware from '../middleware/aclMiddleware';
import { Passport } from '../middleware/passport';

class Organization {
    public readonly router;
    private readonly auth: Auth;
    private readonly authenticatePrivate;

    constructor() {
        this.auth = new Auth();
        this.authenticatePrivate = [new JtwVertification(new Passport()).setup(), new AclMiddleware().setup()];

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
        this.router.get('/user/info/', this.authenticatePrivate, User.info);
    }

}
export default new Organization().router;
