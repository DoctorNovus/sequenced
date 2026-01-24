import { Request, Response, NextFunction } from "express";
import { Unauthorized } from "@outwalk/firefly/errors";
import { User } from "@/user/user.entity";

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

    if (!user) throw new Unauthorized("Invalid API key.");

    req.session.user = { id: user.id, first: user.first };
    next();
}
