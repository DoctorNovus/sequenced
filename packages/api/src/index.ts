import { Application } from "@outwalk/firefly";
import { ExpressPlatform } from "@outwalk/firefly/express";
import { MongooseDatabase } from "@outwalk/firefly/mongoose";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

/* setup the database and global plugins */
const database = await new MongooseDatabase().connect();
database.plugin(import("mongoose-lean-virtuals"));
database.plugin(import("mongoose-lean-id"));

/* setup the platform and global middleware */
const platform = new ExpressPlatform();
platform.use(cors({ origin: [process.env.APP_URL], credentials: true }));

platform.use(session({
    name: "authorization",
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
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
new Application({ platform, database }).listen();