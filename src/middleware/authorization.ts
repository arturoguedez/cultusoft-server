'use strict';
import * as jwt from "jwt-simple";
import * as passport from "passport";
import * as moment from "moment";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from '../models/User';
import { UserInterface } from '../models/UserInterface';
const config = require('config');
import * as acl from 'acl';

export class Authorization {
    private acl;
    public constructor() {
        // passport.use("jwt", this.getStrategy());
        // passport.initialize();
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

                })


            }
        }
    }
    // https://gist.github.com/facultymatt/6370903
    // public something() {
    //     return function(req, res, next) {
    //         // if (req.path.includes(process.env.API_BASE + "login")) return next();
    //
    //         console.log('====');
    //         console.log(req.path);
    //         return Auth.authenticate((err, user, info) => {
    //             if (err) { return next(err); }
    //             if (!user) {
    //                 if (info.name === "TokenExpiredError") {
    //                     return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
    //                 } else {
    //                     return res.status(401).json({ message: 'what' + info.message });
    //                 }
    //             }
    //
    //             return next();
    //         })(req, res, next);
    //     };
    // }
    //
    //
    // private getStrategy = (): Strategy => {
    //     const params = {
    //         secretOrKey: config.get('jwt').secret,
    //         jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    //         passReqToCallback: true
    //     };
    //
    //     return new Strategy(params, (req, payload: any, done) => {
    //         User.findAuthenticationInformation(payload.username)
    //             .then(user => {
    //                 if (user === null) {
    //                     return done(null, false, { message: "The user in the token was not found" });
    //                 }
    //
    //                 return done(null, { username: user.username });
    //             })
    //             .catch(err => {
    //                 return done(err);
    //             });
    //     });
    // }
}

export default Authorization;
