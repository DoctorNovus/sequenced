import { FormEvent, useState } from "react";
import { useDeveloperSendNotification } from "@/hooks/notifications";
import { useUser } from "@/hooks/user";
import { syncServerNotificationsDetailed } from "@/utils/notifs";

export default function DeveloperNotificationSender() {
  const user = useUser();
  const sendNotification = useDeveloperSendNotification();
  const [to, setTo] = useState<"all" | "user" | "me">("me");
  const [targetUserId, setTargetUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaAction, setCtaAction] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [status, setStatus] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    const confirmed = window.confirm(
      to === "all"
        ? "Send this push notification to ALL users?"
        : to === "me"
          ? "Send this push notification to your own account?"
          : "Send this push notification to the selected user?"
    );

    if (!confirmed) return;

    const selfId = user.data?.id;
    const effectiveTargetId = to === "me" ? selfId : targetUserId.trim();
    if (to !== "all" && !effectiveTargetId) {
      setStatus(to === "me" ? "Your user id is still loading. Please try again in a moment." : "Target user id is required.");
      return;
    }

    try {
      const result = await sendNotification.mutateAsync({
        to: to === "all" ? "all" : "user",
        targetUserId: to === "all" ? undefined : effectiveTargetId,
        title: title.trim(),
        body: body.trim(),
        ctaAction: ctaAction.trim() || undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        confirm: true
      });

      let nextStatus = `Queued ${result.count} notification${result.count === 1 ? "" : "s"}.`;
      if (to !== "all") {
        const syncResult = await syncServerNotificationsDetailed();
        if (syncResult.pending > 0 && syncResult.permission === "granted") {
          nextStatus += ` Delivered now: ${syncResult.delivered}/${syncResult.pending}.`;
        } else if (syncResult.pending > 0 && syncResult.permission !== "granted") {
          nextStatus += ` Pending exists, but permission is '${syncResult.permission}'.`;
        } else {
          nextStatus += " Nothing due right now (may be scheduled for later).";
        }
      }

      setStatus(nextStatus);
      setTitle("");
      setBody("");
      setCtaAction("");
      setScheduledFor("");
      if (to === "user") setTargetUserId("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to send notification.";
      setStatus(message);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-primary">Developer Push Sender</h3>
        <p className="text-sm text-muted">Send a server push to one user or all users (confirmation required).</p>
      </div>

      <form onSubmit={submit} className="grid gap-3">
        <label className="flex flex-col gap-1 text-sm text-primary">
          Send to
          <select
            value={to}
            onChange={(event) => setTo(event.target.value as "all" | "user" | "me")}
            className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
          >
            <option value="me">To Me (Recommended)</option>
            <option value="all">To All</option>
            <option value="user">To User</option>
          </select>
        </label>

        {to === "user" && (
          <label className="flex flex-col gap-1 text-sm text-primary">
            Target User ID
            <input
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
              className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
              placeholder="User ID"
              required
            />
          </label>
        )}
        {to === "me" && (
          <p className="text-xs text-muted">
            Target: {user.data?.id || "Loading your user id..."}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-primary">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-primary">
          Body
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-24 rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-primary">
          CTA Action (optional)
          <input
            value={ctaAction}
            onChange={(event) => setCtaAction(event.target.value)}
            className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
            placeholder="/tasks or https://..."
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-primary">
          Schedule for (optional)
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(event) => setScheduledFor(event.target.value)}
            className="rounded-lg border border-accent-blue/20 bg-white px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white"
            disabled={sendNotification.isPending}
          >
            {sendNotification.isPending ? "Sending..." : "Send Push"}
          </button>
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>
      </form>
    </div>
  );
}
