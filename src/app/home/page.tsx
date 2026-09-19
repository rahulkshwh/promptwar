"use client";

import Link from "next/link";
import { Mic, Smartphone, CreditCard, ShieldAlert, ListTodo, Users, CheckCircle2 } from "lucide-react";
import { useTasks } from "@/context/TasksContext";

export default function HomeDashboard() {
  const { tasks, dismissTask, completeTask } = useTasks();
  
  const pendingTasks = tasks.filter(t => !t.completed && !t.dismissed);

  const menuItems = [
    { title: "Talk to Sahaara", icon: <Mic size={40} />, href: "/ask", color: "bg-primary text-primary-foreground" },
    { title: "Phone & Apps", icon: <Smartphone size={40} />, href: "/ask?q=help%20me%20with%20my%20phone", color: "bg-card text-card-foreground border-2 border-border" },
    { title: "Payments", icon: <CreditCard size={40} />, href: "/ask?q=help%20me%20with%20payments", color: "bg-card text-card-foreground border-2 border-border" },
    { title: "Safety", icon: <ShieldAlert size={40} />, href: "/safety", color: "bg-card text-card-foreground border-2 border-border" },
    { title: "Today's Guide", icon: <ListTodo size={40} />, href: "/guide", color: "bg-card text-card-foreground border-2 border-border" },
    { title: "Family Help", icon: <Users size={40} />, href: "/family", color: "bg-card text-card-foreground border-2 border-border" },
  ];

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Good Morning 👋</h1>
        <h2 className="text-2xl text-muted-foreground font-medium">How can I help you today?</h2>
      </header>

      {pendingTasks.length > 0 && (
        <section className="bg-secondary text-secondary-foreground rounded-2xl p-6 shadow-sm border border-yellow-300">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <ListTodo size={32} /> {pendingTasks.length} {pendingTasks.length === 1 ? "thing" : "things"} to check today
          </h3>
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/70 p-5 rounded-xl gap-4">
                <div className="flex items-center gap-4 text-xl font-medium">
                  <span className="text-4xl" aria-hidden="true">{task.icon}</span>
                  <div>
                    <p className="font-bold">{task.title}</p>
                    <p className="text-lg opacity-80">{task.time}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => dismissTask(task.id)}
                    className="flex-1 sm:flex-none px-6 py-4 bg-muted text-muted-foreground rounded-xl font-bold text-lg hover:bg-muted/80"
                    aria-label={`Skip ${task.title}`}
                  >
                    Skip for now
                  </button>
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="flex-1 sm:flex-none px-6 py-4 bg-success text-success-foreground rounded-xl font-bold text-lg shadow-sm"
                    aria-label={`Mark ${task.title} complete`}
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingTasks.length > 3 && (
            <Link href="/guide" className="block mt-6 font-bold underline text-2xl text-center">
              See all tasks
            </Link>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {menuItems.map((item, i) => (
          <Link 
            key={i}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-center ${item.color}`}
          >
            {item.icon}
            <span className="text-2xl font-bold">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

