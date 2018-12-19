'use strict';
import logger from '../utils/logger';

export class AclMiddleware {
    private readonly acl;

    public constructor(acl) {
        this.acl = acl;
    }

    public setup() {
        const self = this;
        return (req, res, next) => {
            if (req.context && req.context.user) {
                const roles = req.context.user.roles;
                const method = req.method.toLowerCase();
                const resource = req.baseUrl + req.path;

                self.acl.areAnyRolesAllowed(roles, resource, [method], (err, allowed) => {
                    if (err) {
                        return next(err);
                    }

                    if (allowed) {
                        return next();
                    }

                    return res.status(401).json({ message: 'Access not allowed.' });
                });
            } else {
                return res.status(401).json({ message: 'User not found' });
            }
        };
    }
}

export default AclMiddleware;
