import * as express from 'express';
import organizationRoutes from './routes/organization';
import * as cookieParser from 'cookie-parser';
import logger from './utils/logger';

class App {
    public express;

    constructor() {
        this.express = express();
        this.setupMiddlewares();
        this.mountRoutes();
    }

    private setupMiddlewares() {
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(cookieParser());
        this.express.use(require("morgan")("combined", { "stream": logger.stream }));
    }

    private mountRoutes() {
        const router = express.Router();

        router.get('/', (req, res) => {
            res.json({
                message: 'Hello there'
            });
        });

        this.express.use('/', router);
        this.express.use('/organization', organizationRoutes);

        // TRY THIS APPROACH
        // https://jonathas.com/token-based-authentication-in-nodejs-with-passport-jwt-and-bcrypt/
        // sorta tried this one but it kinda fails
        // https://medium.com/front-end-hacking/learn-using-jwt-with-passport-authentication-9761539c4314
    }
}
export default new App().express;
