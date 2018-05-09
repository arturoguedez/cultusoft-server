import { BigQueryService } from '../services/bigQueryService';

export class User {
    private bigQueryService: BigQueryService;

    constructor() {
        this.bigQueryService = new BigQueryService();
    }

    public findAuthenticationInformation(username: string): Promise<IUser> {
        return Promise.resolve({
            comparePassword: (password) => {
                return Promise.resolve(password === 'password');
            },
            roles: ['organization_admin'],
            username: 'hello'
        });
    }
}

export interface IUser {
    username: string;
    roles: string[];
    comparePassword(password: string): Promise<boolean>;
}

export default new User();
