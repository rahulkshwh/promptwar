"use client";

import { useTasks, Task } from "@/context/TasksContext";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function DailyGuide() {
  const { tasks, completeTask, dismissTask, resetTasks } = useTasks();

  const periods = ["Morning", "Afternoon", "Evening"] as const;

  const renderTask = (task: Task) => {
    if (task.completed) {
      return (
        <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border-2 border-success/30 opacity-70">
          <CheckCircle2 className="text-success shrink-0" size={32} />
          <div className="flex-1">
            <p className="text-xl font-bold line-through">{task.title}</p>
          </div>
        </div>
      );
    }
    
    if (task.dismissed) {
      return null;
    }

    return (
      <div key={task.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-6 rounded-2xl bg-card border-2 border-border shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-4xl" aria-hidden="true">{task.icon}</span>
          <div>
            <p className="text-2xl font-bold">{task.title}</p>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              <Clock size={20} /> {task.time}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => dismissTask(task.id)}
            className="flex-1 sm:flex-none px-6 py-4 bg-muted text-muted-foreground rounded-xl font-bold text-lg hover:bg-muted/80"
          >
            Dismiss
          </button>
          <button 
            onClick={() => completeTask(task.id)}
            className="flex-1 sm:flex-none px-6 py-4 bg-success text-success-foreground rounded-xl font-bold text-lg shadow-sm hover:scale-[1.02] transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold">Daily Guide</h1>
          <p className="text-xl text-muted-foreground mt-2">Your important tasks for today.</p>
        </div>
        <button 
          onClick={resetTasks}
          className="p-3 text-primary font-bold underline hidden sm:block"
        >
          Reset Demo Data
        </button>
      </header>

      <div className="space-y-10">
        {periods.map(period => {
          const periodTasks = tasks.filter(t => t.period === period);
          if (periodTasks.length === 0) return null;

          const allDismissed = periodTasks.every(t => t.dismissed);
          if (allDismissed) return null;

          return (
            <section key={period} className="space-y-4">
              <h2 className="text-3xl font-bold text-primary flex items-center gap-2 border-b-2 border-border pb-2">
                {period === "Morning" && "☀️"}
                {period === "Afternoon" && "🌤️"}
                {period === "Evening" && "🌙"}
                {period}
              </h2>
              <div className="space-y-4">
                {periodTasks.map(renderTask)}
              </div>
            </section>
          );
        })}
      </div>

      {tasks.every(t => t.completed || t.dismissed) && (
        <div className="text-center py-16 space-y-6">
          <div className="mx-auto w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-4xl font-bold">All caught up!</h2>
          <p className="text-xl text-muted-foreground">You have finished your tasks for today.</p>
          <button 
            onClick={resetTasks}
            className="mt-8 px-6 py-3 bg-muted rounded-xl font-bold"
          >
            Reset (Demo)
          </button>
        </div>
      )}
    </div>
  );
}

