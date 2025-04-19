import { DaysAsNumbers, MonthsAsNumbers, getDateDD, getNameByDate, getNameByMonth } from "@/utils/date";

interface IntroductionParams {
    skeleton: boolean;
}

export default function HomeIntroduction({ skeleton, user, today }: IntroductionParams) {
    if (skeleton)
        return <div className="flex flex-col gap-1">
            <span className="text-2xl">Hello!</span>
            <span className="text-xl text-gray-500">Loading Date...</span>
        </div>

    return (
        <div className="flex flex-col gap-1">
            {
                user.isSuccess && user.data.first ? (
                    <span className="text-2xl">Hello <span className="text-accent-blue">{user.data.first}</span>!</span>
                ) : (
                    <span className="text-2xl">Hello!</span>
                )
            }
            <span className="text-xl text-gray-500">
                {getNameByDate(today.getDay() as DaysAsNumbers)}, {getNameByMonth(today.getMonth() as MonthsAsNumbers)} {getDateDD(today)}
            </span>
        </div>
    )
}