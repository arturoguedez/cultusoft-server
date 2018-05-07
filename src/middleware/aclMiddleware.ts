'use strict';
import * as jwt from "jwt-simple";
import * as passport from "passport";
import * as moment from "moment";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from '../models/User';
import { UserInterface } from '../models/UserInterface';
const config = require('config');
import * as acl from 'acl';


import { BigQueryService } from '../services/bigQueryService';

export class AclMiddleware {
    private readonly acl;

    public constructor() {
        this.acl = new acl(new acl.memoryBackend());
        this.loadAcl();
    }

    private loadAcl() {
        let bigQueryService = new BigQueryService();

        let query =
            `
          SELECT *
          FROM acl
          `;


        bigQueryService.query(config.get('google').bigQuery.dataSet, query)
            .then((result) => {
                let allowedList = result;
                let allow = [];
                allowedList.forEach((allowed) => {
                    allow.push({
                        roles: allowed.role,
                        allows: [{ resources: allowed.resource, permissions: allowed.permission }]
                    });
                })

                this.acl.allow(allow);
            });
    }

    public setup() {
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
