import { Request, Response, NextFunction } from "express";
import { Unauthorized } from "@outwalk/firefly/errors";

export function session(req: Request, _res: Response, next: NextFunction) {
    if (!req.session.user) throw new Unauthorized("Not Logged In");
    next();
}