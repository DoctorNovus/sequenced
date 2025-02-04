import { useUser } from "@/hooks/user";
import { DaysAsNumbers, MonthsAsNumbers, getDateDD, getNameByDate, getNameByMonth } from "@/utils/date";
import { useTasksIncomplete, useTasksOverdue, useTasksToday, useTasksTomorrow, useTasksWeek } from "@/hooks/tasks";
import { TaskItem } from "@/components/task/TaskItem";

import DueCapsule from "./(Home)/DueCapsule";
import AuthProvider from "./Auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

const Home = () => {
    const auth = useAuth();

    const user = useUser();

    const dueToday = useTasksToday();
    const dueTomorrow = useTasksTomorrow();
    const dueWeek = useTasksWeek();
    const overdueTasks = useTasksOverdue();
    const incomplete = useTasksIncomplete();

    if (auth.isSuccess && auth.data.message != "Logged In")
        return <Navigate to="/auth" />

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);


    if (auth.isLoading)
        return <>Loading...</>

    return (
        <AuthProvider>
            <div className="w-full h-full flex flex-col px-4 py-2 gap-4">
                <div className="flex flex-col gap-1">
                    {
                        user.data.first ? (
                            <span className="text-2xl">Hello <span className="text-accent-blue">{user.data.first}</span>!</span>
                        ) : (
                            <span className="text-2xl">Hello!</span>
                        )
                    }
                    <span className="text-xl text-gray-500">{getNameByDate(today.getDay() as DaysAsNumbers)}, {getNameByMonth(today.getMonth() as MonthsAsNumbers)} {getDateDD(today)}</span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-xl">Your Agenda</span>
                    <div className="w-full flex flex-col gap-2">
                        <div className="w-full h-full flex flex-row justify-evenly gap-2">
                            <div className="w-full h-full">
                                {
                                    dueToday.isSuccess && (
                                        <DueCapsule count={dueToday.data.count} category="Due Today" important />
                                    )
                                }
                            </div>
                            <div className="w-full h-full flex flex-col justify-evenly gap-2">
                                {
                                    dueTomorrow.isSuccess && (
                                        <DueCapsule count={dueTomorrow.data.count} category="Due Tomorrow" important />
                                    )
                                }
                                {
                                    dueWeek.isSuccess && (
                                        <DueCapsule count={dueWeek.data.count} category="Due This Week" important />
                                    )
                                }
                            </div>
                        </div>
                        <div className="w-full h-16 flex shadow-md border border-accent-blue/80 rounded-md px-4 py-2 items-center justify-between">
                            {
                                overdueTasks.isSuccess && (
                                    <>
                                        <span className="text-xl text-gray-500">Overdue Tasks</span>
                                        <span className="text-red-500 text-3xl">{overdueTasks.data.count}</span>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-2 pb-32">
                    <span className="text-xl">Upcoming Tasks</span>
                    <ul className="w-full flex flex-col">
                        {incomplete.isSuccess && incomplete.data.map((task, key) => {
                            return (
                                <li key={key} className="w-full h-full">
                                    <TaskItem item={task} taskFilter="all" />
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </AuthProvider>
    )

};

export default Home;