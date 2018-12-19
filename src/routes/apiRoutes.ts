import * as express from 'express';
import { Auth } from '../controllers/organization/auth';
import User from '../controllers/organization/user';
import { Signup, Signin } from '../controllers/company';
import { AclMiddleware, JtwVertification, Passport } from '../middleware';
import { Signin as SigninValidator } from '../validators/company';

export class ApiRoutes {
  public readonly router;
  private readonly auth: Auth;
  private readonly signup: Signup;
  private readonly signin: Signin;
  private readonly authenticatePrivate;

  constructor(acl) {
    this.auth = new Auth();
    this.signup = new Signup();
    this.signin = new Signin();
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

    this.router.post('/v1/company/signup/', this.signup.create);
    this.router.post('/v1/company/signin/', new SigninValidator().validate(), this.signin.signin);

    // this.router.post('/v1/company/signin/', [
    //   check('emassil').exists().withMessage('must be an email'),
    //   function(req, res, next) {
    //     console.log("I do get calld, so what's the dail");
    //     next();
    //   }
    // ], this.signin.signin);
  }
}
export default ApiRoutes;
