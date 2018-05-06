import { UserInterface } from './UserInterface';
import { BigQueryService } from '../services/bigQueryService';

export class User {
    private bigQueryService: BigQueryService;

    constructor() {
        this.bigQueryService = new BigQueryService();
    }

    public findAuthenticationInformation(username: string): Promise<UserInterface> {
        // bigQueryService.query()
        return Promise.resolve({
            username: 'hello',
            roles: ['guest'],
            comparePassword: (password) => {
                console.log("given passwr" + password);
                return Promise.resolve(password === 'password');
            }
        });
    }
}

export default new User();
