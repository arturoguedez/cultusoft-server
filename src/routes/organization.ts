import * as express from 'express';
import Auth from '../controllers/organization/auth';
import User from '../controllers/organization/user';
import JtwVertification from '../middleware/jwt';
import Authorization from '../middleware/authorization';

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

        this.router.get('/user/info/', [new JtwVertification(Auth).setup(), new Authorization().setup()], User.info);
    }

}
export default new Organization().router;
