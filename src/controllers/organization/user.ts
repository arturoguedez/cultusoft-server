export class User {
    public constructor() {
    }

    public info = async (req, res) => {
        return Promise.resolve(res.status(200).json({ a: 'you got the info' }));
    }
}

export default new User();
