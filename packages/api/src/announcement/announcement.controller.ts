import { Controller, Delete, Get, Inject, Middleware, Patch, Post } from "@outwalk/firefly";
import { BadRequest, Unauthorized } from "@outwalk/firefly/errors";
import { Request } from "express";
import { session } from "@/_middleware/session";
import { Announcement } from "./announcement.entity";
import { AnnouncementService } from "./announcement.service";
import { UserService } from "@/user/user.service";

@Controller()
@Middleware(session)
export class AnnouncementController {

    @Inject()
    announcementService: AnnouncementService;

    @Inject()
    userService: UserService;

    @Get()
    async listUnread({ session }: Request): Promise<Announcement[]> {
        return this.announcementService.listUnread(session.user.id);
    }

    @Patch("/read")
    async markRead({ session, body }: Request): Promise<{ readAnnouncementIds: string[] }> {
        const incoming = Array.isArray(body?.ids) ? body.ids : [];
        const ids = incoming
            .map((value) => typeof value === "string" ? value.trim() : "")
            .filter((value) => value.length > 0);

        if (!ids.length) {
            throw new BadRequest("At least one announcement id is required.");
        }

        const readAnnouncementIds = await this.userService.markAnnouncementsRead(session.user.id, ids);
        return { readAnnouncementIds };
    }

    @Get("/all")
    async listAll({ session }: Request): Promise<Announcement[]> {
        await this.assertDeveloper(session.user.id);
        return this.announcementService.listAll();
    }

    @Post()
    async create({ session, body }: Request): Promise<Announcement> {
        await this.assertDeveloper(session.user.id);

        const parsed = this.validateAnnouncementInput(body, false);

        return this.announcementService.createAnnouncement({
            ...parsed
        });
    }

    @Patch("/:id")
    async update({ session, params, body }: Request): Promise<Announcement> {
        await this.assertDeveloper(session.user.id);
        if (!params?.id) throw new BadRequest("Announcement id is required.");

        const parsed = this.validateAnnouncementInput(body, true);
        const updated = await this.announcementService.updateAnnouncement(params.id, parsed);
        if (!updated) throw new BadRequest("Announcement not found.");
        return updated;
    }

    @Delete("/:id")
    async remove({ session, params }: Request): Promise<{ success: true }> {
        await this.assertDeveloper(session.user.id);
        if (!params?.id) throw new BadRequest("Announcement id is required.");

        const ok = await this.announcementService.deleteAnnouncement(params.id);
        if (!ok) throw new BadRequest("Announcement not found.");

        return { success: true };
    }

    @Post("/:id/view")
    async view({ session, params }: Request): Promise<{ success: true }> {
        if (!params?.id) throw new BadRequest("Announcement id is required.");
        const ok = await this.announcementService.trackView(params.id, session.user.id);
        if (!ok) throw new BadRequest("Announcement not found.");
        return { success: true };
    }

    @Post("/:id/click")
    async click({ session, params }: Request): Promise<{ success: true }> {
        if (!params?.id) throw new BadRequest("Announcement id is required.");
        const ok = await this.announcementService.trackClick(params.id, session.user.id);
        if (!ok) throw new BadRequest("Announcement not found.");
        return { success: true };
    }

    private isValidAction(action: string): boolean {
        if (action.startsWith("tidaltask:")) {
            return action.length > "tidaltask:".length;
        }

        if (action.startsWith("sequenced:")) {
            return action.length > "sequenced:".length;
        }

        if (action.startsWith("/")) return true;

        try {
            const url = new URL(action);
            return url.protocol === "https:" || url.protocol === "http:";
        } catch {
            return false;
        }
    }

    private async assertDeveloper(userId: string): Promise<void> {
        const user = await this.userService.getUserById(userId);
        if (!user?.developer) {
            throw new Unauthorized("Developer access required.");
        }
    }

    private validateAnnouncementInput(body: unknown, allowPartial: boolean): Partial<Announcement> {
        const input = (body && typeof body === "object") ? body as Record<string, unknown> : {};
        const title = typeof input.title === "string" ? input.title.trim() : undefined;
        const message = typeof input.body === "string" ? input.body.trim() : undefined;
        const ctaTitle = typeof input.ctaTitle === "string" ? input.ctaTitle.trim() : undefined;
        const ctaAction = typeof input.ctaAction === "string" ? input.ctaAction.trim() : undefined;
        const active = typeof input.active === "boolean" ? input.active : undefined;
        const hasDate = input.date !== undefined;
        const parsedDate = hasDate ? new Date(String(input.date)) : undefined;

        if (!allowPartial || title !== undefined) {
            if (!title) throw new BadRequest("Title is required.");
        }
        if (!allowPartial || message !== undefined) {
            if (!message) throw new BadRequest("Body is required.");
        }

        const hasCtaTitle = ctaTitle !== undefined && ctaTitle.length > 0;
        const hasCtaAction = ctaAction !== undefined && ctaAction.length > 0;
        if (hasCtaTitle !== hasCtaAction) {
            throw new BadRequest("CTA title and CTA action must both be provided.");
        }

        if (hasCtaAction && !this.isValidAction(ctaAction as string)) {
            throw new BadRequest("CTA action must be an https/http URL, a relative path, or a tidaltask:* action (sequenced:* also supported).");
        }

        if (hasDate && (!parsedDate || Number.isNaN(parsedDate.getTime()))) {
            throw new BadRequest("Date is invalid.");
        }

        const updates: Partial<Announcement> = {};
        if (title !== undefined) updates.title = title;
        if (message !== undefined) updates.body = message;
        if (parsedDate) updates.date = parsedDate;
        if (ctaTitle !== undefined || ctaAction !== undefined) {
            updates.ctaTitle = hasCtaTitle ? ctaTitle : "";
            updates.ctaAction = hasCtaAction ? ctaAction : "";
        }
        if (active !== undefined) updates.active = active;

        if (!allowPartial && !updates.date) {
            updates.date = new Date();
        }

        return updates;
    }
}
