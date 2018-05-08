'use strict';
import logger from '../utils/logger';

export class AclMiddleware {
    private readonly acl;

    public constructor(acl) {
        this.acl = acl
    }

    public setup() {
        logger.debug("checking resources for guest");
        this.acl.whatResources('organization_admin').then((x) => {
            logger.debug(JSON.stringify(x));
        })

        let self = this;
        return function(req, res, next) {
            if (req.context && req.context.user) {
                let roles = req.context.user.roles;
                let method = req.method.toLowerCase();
                let resource = req.baseUrl + req.path;

                self.acl.areAnyRolesAllowed(roles, resource, [method], (err, allowed) => {
                    if (err) {
                        return next(err);
                    }

                    if (allowed) {
                        return next();
                    }

                    return res.status(401).json({ message: "Access not allowed." });
                });
            } else {
                return res.status(401).json({ message: "User not found" });
            }
        }
    }
}

export default AclMiddleware;
