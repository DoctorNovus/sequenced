import { DaysAsNumbers, MonthsAsNumbers, getDateDD, getNameByDate, getNameByMonth } from "@/utils/date";

interface IntroductionParams {
    skeleton?: boolean;
    user?: any;
    today?: Date;
}

export default function HomeIntroduction({ skeleton, user, today }: IntroductionParams) {
    if (skeleton)
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-blue-700 to-accent-blue-500 px-6 py-5 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%)]" />
                <div className="relative flex flex-col gap-2">
                    <span className="text-sm uppercase tracking-[0.18em] text-white/70">Today</span>
                    <span className="text-3xl font-semibold">Hello!</span>
                    <span className="text-lg text-white/80">Loading your day...</span>
                </div>
            </div>
        )

    const hasName = user?.isSuccess && user.data.first;
    const activeDay = today || new Date();
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-blue-700 via-accent-blue-600 to-accent-blue-500 px-6 py-5 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.25),transparent_35%)] opacity-80" />
            <div className="absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-3">
                <div className="flex items-start justify-between ">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm uppercase tracking-[0.18em] text-white/70">Today</span>
                        <span className="text-3xl font-semibold">
                            Hello{hasName ? ` ${user.data.first}` : ""}!
                        </span>
                    </div>
                </div>
                <a
                    href={`/calendar?scope=today&view=week`}
                    className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/12 text-base font-semibold text-white"
                >
                    <span>{getNameByDate(activeDay.getDay() as DaysAsNumbers)},</span>
                    <span>{getNameByMonth(activeDay.getMonth() as MonthsAsNumbers)} {getDateDD(activeDay)}</span>
                </a>
            </div>
        </div>
    )
}
