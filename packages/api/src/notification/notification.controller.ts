import { Controller, Get, Inject, Middleware, Patch, Post } from "@outwalk/firefly";
import { BadRequest, Unauthorized } from "@outwalk/firefly/errors";
import { Request } from "express";
import { session } from "@/_middleware/session";
import { NotificationService } from "./notification.service";
import { UserService } from "@/user/user.service";

@Controller()
@Middleware(session)
export class NotificationController {

    @Inject()
    notificationService: NotificationService;

    @Inject()
    userService: UserService;

    @Get("/preferences")
    async getPreferences({ session }: Request) {
        return this.notificationService.getPreferences(session.user.id);
    }

    @Patch("/preferences")
    async updatePreferences({ session, body }: Request) {
        return this.notificationService.updatePreferences(session.user.id, body ?? {});
    }

    @Get("/pending")
    async getPending({ session }: Request) {
        return this.notificationService.getPendingForUser(session.user.id);
    }

    @Get("/status")
    async getQueueStatus({ session }: Request) {
        return this.notificationService.getQueueStatus(session.user.id);
    }

    @Post("/ack")
    async acknowledgeDelivered({ session, body }: Request): Promise<{ acknowledged: number }> {
        const incoming = Array.isArray(body?.ids) ? body.ids : [];
        const ids = incoming
            .map((value) => typeof value === "string" ? value.trim() : "")
            .filter((value) => value.length > 0);

        return this.notificationService.acknowledgeDelivered(session.user.id, ids);
    }

    @Post("/developer/send")
    async developerSend({ session, body }: Request): Promise<{ count: number }> {
        await this.assertDeveloper(session.user.id);

        const to = body?.to === "all" ? "all" : body?.to === "user" ? "user" : "";
        if (!to) throw new BadRequest("to must be 'user' or 'all'.");

        if (body?.confirm !== true) {
            throw new BadRequest("Developer confirmation required.");
        }

        const title = typeof body?.title === "string" ? body.title.trim() : "";
        const message = typeof body?.body === "string" ? body.body.trim() : "";
        const ctaAction = typeof body?.ctaAction === "string" ? body.ctaAction.trim() : "";
        const targetUserId = typeof body?.targetUserId === "string" ? body.targetUserId.trim() : "";
        const scheduledFor = body?.scheduledFor ? new Date(body.scheduledFor) : new Date();

        if (!title) throw new BadRequest("Title is required.");
        if (!message) throw new BadRequest("Body is required.");
        if (to === "user" && !targetUserId) throw new BadRequest("targetUserId is required when sending to user.");
        if (Number.isNaN(scheduledFor.getTime())) throw new BadRequest("scheduledFor is invalid.");

        return this.notificationService.enqueueDeveloperMessage({
            to,
            targetUserId: targetUserId || undefined,
            title,
            body: message,
            ctaAction: ctaAction || undefined,
            scheduledFor,
            createdBy: session.user.id
        });
    }

    private async assertDeveloper(userId: string): Promise<void> {
        const user = await this.userService.getUserById(userId);
        if (!user?.developer) {
            throw new Unauthorized("Developer access required.");
        }
    }
}
