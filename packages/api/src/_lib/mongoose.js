import mongoose from "mongoose";

/* export the Schema and Model objects from mongoose so we can modify the types */
export { Schema, Model } from "mongoose";

/* An object to connect to a mongodb database using mongoose */
export class MongooseDatabase {

    constructor(options = {}) {
        this.options = options;
        this.url = options.url ?? process.env.DATABASE_URL;
    }

    async plugin(plugin) {
        mongoose.plugin((plugin instanceof Promise) ? (await plugin).default : plugin);
    }

    async connect() {
        console.log("Connecting to database...");

        if (!this.url) throw new Error("You must provide a url to MongooseDatabase.");

        await mongoose.connect(this.url, this.options).catch((error) => { throw error; });
        mongoose.connection.on("error", (error) => { throw error; });

        return this;
    }

    isConnected() {
        return mongoose.connection.readyState == 1;
    }

    static get connection() {
        return mongoose.connection;
    }
}

/* get the prototype chain as an array of strings */
function getPrototypeChain(target) {
    let parent = Object.getPrototypeOf(target.prototype).constructor;
    const parents = [];

    while (parent.name != "Object") {
        parents.push((parent.name == "model") ? parent.modelName : parent.name);
        parent = Object.getPrototypeOf(parent.prototype).constructor;
    }

    return parents;
}

/* create a mongoose entity */
export function Entity(options) {
    return (target) => {

        /* collect the prototype chain and reset the target prototype */
        const prototype = getPrototypeChain(target);
        Object.setPrototypeOf(target, Object.prototype);

        const schema = new mongoose.Schema(target._props, options);

        /* load the entity class as a schema to pull in methods, statics, and virtuals */
        schema.loadClass(target);

        /* apply indexes to the schema before compiling the model */
        (target._indexes ?? []).forEach((index) => schema.index(...index));

        /* apply plugins to the schema before compiling the model */
        (target._plugins ?? []).forEach((plugin) => schema.plugin(plugin));

        /* apply virtuals to the schema before compiling the model */
        if (target._virtuals) {
            for (let [key, options] of Object.entries(target._virtuals)) {
                const virtual = schema.virtual(key, options);
                if (options.get) virtual.get(options.get);
                if (options.set) virtual.set(options.set);
            }
        }

        if (!prototype.includes("Schema") && !prototype.includes("Model")) {
            throw new Error(`${target.name} or a parent must extend either Schema or Model.`);
        }

        /* if the immediate parent class is a model, compile it as a discriminator */
        if (mongoose.models[prototype[0]]) {
            return mongoose.models[prototype[0]].discriminator(target.name, schema);
        }

        return (prototype.includes("Schema")) ? schema : new mongoose.model(target.name, schema);
    };
}

/* a decorator to define an index on the database */
export function Index(...index) {
    return (target) => {
        target._indexes = target._indexes ?? [];
        target._indexes.push(index);
    };
}

/* a decorator to apply a plugin to the schema */
export function Plugin(plugin) {
    return (target) => {
        target._plugins = target._plugins ?? [];
        target._plugins.push(plugin);
    };
}

/* a decorator to define schema virtual properties on an entity */
export function Virtual(virtual) {
    return (target, key) => {
        target.constructor._virtuals = target.constructor._virtuals ?? {};
        target.constructor._virtuals[key] = virtual;
    };
}

/* a decorator to define schema properties on an entity */
export function Prop(type) {
    const isObject = (obj) => (obj != undefined && Object.getPrototypeOf(obj) === Object.prototype);
    const isModel = (obj) => (obj?.name == "model");
    const isSchema = (obj) => (obj instanceof mongoose.Schema);

    /* process the type to resolve references to other models */
    const processType = (type) => {
        /* the type is a mongoose model */
        if (isModel(type)) {
            return { type: mongoose.Types.ObjectId, ref: type.modelName };
        }

        /* the type is a mongoose schema */
        if (isSchema(type)) {
            return { type: type, default: () => ({}) };
        }

        /* the type is an array */
        if (Array.isArray(type)) {

            /* the type is a nested object */
            if (isObject(type[0])) {
                type[0] = processType(type[0]);

                return type;
            }

            /* subtype is a mongoose model */
            if (isModel(type[0])) {
                return [{ type: mongoose.Types.ObjectId, ref: type[0].modelName }];
            }

            /* subtype is a mongoose schema */
            if (isSchema(type[0])) return [type[0]];
        }

        /* the type is an object */
        if (isObject(type)) {

            /* subtype is an array */
            if (Array.isArray(type?.type)) {
                type.type = processType(type.type);

                return type;
            }

            /* subtype is a mongoose model */
            if (isModel(type?.type)) {
                type.ref = type.type.modelName;
                type.type = mongoose.Types.ObjectId;

                return type;
            }

            /* the type is a mongoose schema */
            if (isSchema(type?.type)) {
                /* use === to avoid type coercion */
                type.default = (type.default === undefined) ? () => ({}) : type.default;

                return type;
            }

            /* search the remaining properties and process them */
            for (let name of Object.getOwnPropertyNames(type)) {
                type[name] = processType(type[name]);
            }
        }

        return type;
    };

    return (target, key) => {
        target.constructor._props = target.constructor._props ?? {};
        target.constructor._props[key] = processType(type);
    };
}