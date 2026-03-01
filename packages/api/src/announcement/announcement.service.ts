import { Injectable, Inject } from "@outwalk/firefly";
import { Announcement } from "./announcement.entity";
import { UserService } from "@/user/user.service";

@Injectable()
export class AnnouncementService {

    @Inject()
    userService: UserService;

    async listUnread(userId: string): Promise<Announcement[]> {
        const readIds = await this.userService.getReadAnnouncementIds(userId);

        return Announcement.find({
            active: true,
            date: { $lte: new Date() },
            _id: { $nin: readIds }
        }).sort({ date: -1, createdAt: -1 }).lean<Announcement[]>().exec();
    }

    async listAll(): Promise<Announcement[]> {
        return Announcement.find()
            .sort({ date: -1, createdAt: -1 })
            .populate({ path: "viewedBy", select: "id first last email" })
            .populate({ path: "clickedBy", select: "id first last email" })
            .lean<Announcement[]>()
            .exec();
    }

    async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
        return Announcement.create(data);
    }

    async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement | null> {
        return Announcement.findByIdAndUpdate(id, data, { new: true }).lean<Announcement>().exec();
    }

    async deleteAnnouncement(id: string): Promise<boolean> {
        const removed = await Announcement.findByIdAndDelete(id).lean<Announcement>().exec();
        return Boolean(removed);
    }

    async trackView(id: string, userId: string): Promise<boolean> {
        const result = await Announcement.updateOne(
            { _id: id },
            { $addToSet: { viewedBy: userId } }
        ).exec();
        return (result.matchedCount ?? 0) > 0;
    }

    async trackClick(id: string, userId: string): Promise<boolean> {
        const result = await Announcement.updateOne(
            { _id: id },
            {
                $addToSet: {
                    clickedBy: userId,
                    viewedBy: userId
                }
            }
        ).exec();
        return (result.matchedCount ?? 0) > 0;
    }
}
