import { Entity, Model, Prop } from "@outwalk/firefly/mongoose";

@Entity()
export class SubTask extends Model {

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, default: "" })
    description: string;

    /** this should be changed to a Date object, but current filtering logic is using regex on a string */
    @Prop({ type: String, default: () => new Date().toString() })
    date: string;

    @Prop({ type: Boolean, default: false })
    done: boolean;

    @Prop({ type: String, default: "" })
    repeater: string;

    @Prop({ type: String, default: "" })
    reminder: string;

    @Prop({ type: String, default: "" })
    type: string;

    /** (git blame Hiro) - figure out what this actually does */
    @Prop({ type: Boolean, default: false })
    accordion: boolean;

}