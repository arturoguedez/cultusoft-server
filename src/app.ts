import * as express from 'express';
import { OrganizationRoutes } from './routes/organizationRoutes';
import * as cookieParser from 'cookie-parser';
import logger from './utils/logger';
import * as Acl from 'acl';
const config = require('config');
import { BigQueryService } from './services/bigQueryService';
import { MigrationRunner } from './data/migrationRunner';
import { AclLoader } from './utils/aclLoader';

export class App {
    public express;

    constructor() {
        this.express = express();
        this.setupMiddlewares();
    }

    public async setup() {
        await this.runMigrations();
        let acl = await this.loadAcl();
        this.mountRoutes(acl);
        return Promise.resolve();
    };

    public start() {
        const port = process.env.PORT || config.get('server').port;

        this.express.listen(port, (err) => {
            if (err) {
                return logger.error(err);
            }

            logger.info(`server is listening on ${port}`);
        });
    }

    private setupMiddlewares() {
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(cookieParser());
        this.express.use(require("morgan")("combined", { "stream": logger.stream }));
    }
    private mountRoutes(acl) {
        const router = express.Router();

        router.get('/', (req, res) => {
            res.json({
                message: 'Hello there'
            });
        });

        this.express.use('/', router);
        this.express.use('/organization', new OrganizationRoutes(acl).getRouter());

        // TRY THIS APPROACH
        // https://jonathas.com/token-based-authentication-in-nodejs-with-passport-jwt-and-bcrypt/
        // sorta tried this one but it kinda fails
        // https://medium.com/front-end-hacking/learn-using-jwt-with-passport-authentication-9761539c4314
    }

    private runMigrations() {
        let bigQueryService = new BigQueryService();
        return new MigrationRunner(bigQueryService).runMigrations(config.get('google').bigQuery.dataSet)
    }

    private loadAcl(): Promise<any> {
        return new AclLoader().loadAcl();
    }
}
export default App;
