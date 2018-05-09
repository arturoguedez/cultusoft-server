import * as express from 'express';
import { Auth } from '../controllers/organization/auth';
import User from '../controllers/organization/user';
import AclMiddleware from '../middleware/aclMiddleware';
import JtwVertification from '../middleware/jwt';
import { Passport } from '../middleware/passport';

export class OrganizationRoutes {
    public readonly router;
    private readonly auth: Auth;
    private readonly authenticatePrivate;

    constructor(acl) {
        this.auth = new Auth();
        this.authenticatePrivate = [new JtwVertification(new Passport()).setup(), new AclMiddleware(acl).setup()];

        this.router = express.Router();
        this.mountRoutes();
    }

    public getRouter() {
        return this.router;
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
export default OrganizationRoutes;
