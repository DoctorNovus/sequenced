import { Application } from "@outwalk/firefly";
import { ExpressPlatform } from "@outwalk/firefly/express";
import { MongooseDatabase } from "@/_lib/mongoose";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

const appUrl = process.env.APP_URL;
const sessionSecret = process.env.SESSION_SECRET;

if (!appUrl) {
    throw new Error("APP_URL environment variable is required");
}

if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
}

/* setup the database and global plugins */
const database = await new MongooseDatabase().connect();
const leanVirtualsModule = await import("mongoose-lean-virtuals");
const leanIdModule = await import("mongoose-lean-id");

const leanVirtualsPlugin = (leanVirtualsModule.default ?? leanVirtualsModule) as any;
const leanIdPlugin = (leanIdModule.default ?? leanIdModule) as any;

database.plugin(leanVirtualsPlugin);
database.plugin(leanIdPlugin);

/* setup the platform and global middleware */
const platform = new ExpressPlatform();
platform.use(cors({ origin: [appUrl], credentials: true }));
platform.set("trust proxy", 4);

platform.use(session({
    name: "authorization",
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    store: MongoStore.create({
        /* @ts-ignore - connect-mongo has a type conflict here that is safe to ignore */
        client: MongooseDatabase.connection.getClient(),
        collectionName: "session"
    })
}));

platform.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10000,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
}));

/* start the application */
new Application({ platform }).listen();
