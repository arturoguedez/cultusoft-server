export interface UserInterface {

    username: string;

    comparePassword(password: string): Promise<boolean>;
}
