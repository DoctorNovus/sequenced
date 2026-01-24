import { Request, Response, NextFunction } from "express";
import { Unauthorized } from "@outwalk/firefly/errors";
import { User } from "../user/user.entity";
import { DeviceToken } from "../auth/deviceToken.entity";
import crypto from "crypto";

export async function session(req: Request, _res: Response, next: NextFunction) {
    if (req.session.user) {
        next();
        return;
    }

    const authHeader = req.headers.authorization ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new Unauthorized("Not Logged In");

    const token = match[1].trim();
    if (!token) throw new Unauthorized("Not Logged In");

    const user = await User.findOne({
        $expr: {
            $in: [
                token,
                {
                    $map: {
                        input: { $objectToArray: { $ifNull: ["$apiKeys", {}] } },
                        as: "kv",
                        in: "$$kv.v"
                    }
                }
            ]
        }
    }).lean<User>().exec();

    if (user) {
        req.session.user = { id: user.id, first: user.first };
        next();
        return;
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const deviceToken = await DeviceToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } })
        .populate({ path: "user", select: "first last email id" })
        .lean<DeviceToken>()
        .exec();

    if (!deviceToken?.user) throw new Unauthorized("Invalid token.");

    const deviceUser = deviceToken.user as any;
    req.session.user = { id: deviceUser.id, first: deviceUser.first };
    next();

    req.session.user = { id: user.id, first: user.first };
    next();
}
