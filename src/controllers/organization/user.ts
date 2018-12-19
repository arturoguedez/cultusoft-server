export class User {
    public info(req, res): Promise<any> {
        return Promise.resolve(res.status(200).json({ a: 'you got the info' }));
    }
}

export default new User();
