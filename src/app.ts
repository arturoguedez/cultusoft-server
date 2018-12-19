import * as Acl from 'acl';
import config = require('config');
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { ApiRoutes } from './routes/apiRoutes';
import { AclLoader } from './utils/aclLoader';
import { IGoogleConfig, IServerConfig } from './utils/configs';
import logger from './utils/logger';
// Needed for Type ORM
import "reflect-metadata";
import { createConnection } from "typeorm";
import * as i18n from 'i18n';

export class App {
  public express;

  constructor() {
    this.express = express();
    this.setupMiddlewares();
  }

  public async setup() {
    await createConnection();
    const acl = await this.loadAcl();
    this.mountRoutes(acl);
    return Promise.resolve();
  }

  public start() {
    const port = process.env.PORT || config.get<IServerConfig>('server').port;

    this.express.listen(port, (err) => {
      if (err) {
        return logger.error(err);
      }

      logger.info(`server is listening on ${port}`);
    });
  }

  private setupMiddlewares() {
    i18n.configure({
      locales: ['en', 'fr'],
      directory: __dirname + '/locales',
      objectNotation: true
    });
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(cookieParser());
    this.express.use(require('morgan')('combined', { stream: logger.stream }));

    this.express.use(i18n.init);

    this.express.use(function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
      // res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      next();
    });
  }
  private mountRoutes(acl) {
    const router = express.Router();

    router.get('/', (req, res) => {
      res.json({
        message: 'Hello there'
      });
    });

    this.express.use('/', router);
    this.express.use('/api', new ApiRoutes(acl).getRouter());
  }

  private loadAcl(): Promise<any> {
    return new AclLoader().loadAcl();
  }
}
export default App;
