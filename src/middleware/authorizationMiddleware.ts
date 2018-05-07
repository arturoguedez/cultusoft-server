'use strict';
import * as jwt from "jwt-simple";
import * as passport from "passport";
import * as moment from "moment";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from '../models/User';
import { UserInterface } from '../models/UserInterface';
const config = require('config');
import * as acl from 'acl';

export class AuthorizationMiddleware {
    private readonly acl;

    public constructor() {
        this.acl = new acl(new acl.memoryBackend());
    }

    public setup() {
        this.acl.allow([
            {
                roles: ['guest', 'member'],
                allows: [
                    { resources: '/organization/user/info/', permissions: 'get' },
                    { resources: 'blogs', permissions: 'get' },
                    { resources: ['forums', 'news'], permissions: ['get', 'put', 'delete'] }
                ]
            },
            {
                roles: ['gold', 'silver'],
                allows: [
                    { resources: 'cash', permissions: ['sell', 'exchange'] },
                    { resources: ['account', 'deposit'], permissions: ['put', 'delete'] }
                ]
            }
        ])
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

export default AuthorizationMiddleware;
