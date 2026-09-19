"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Task {
  id: string;
  title: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  completed: boolean;
  dismissed: boolean;
  icon: string;
}

interface TasksContextType {
  tasks: Task[];
  completeTask: (id: string) => void;
  dismissTask: (id: string) => void;
  resetTasks: () => void;
}

const mockTasks: Task[] = [
  { id: "1", title: "Medicine reminder", time: "8:00 AM", period: "Morning", completed: false, dismissed: false, icon: "💊" },
  { id: "2", title: "Check today's appointments", time: "9:00 AM", period: "Morning", completed: false, dismissed: false, icon: "📋" },
  { id: "3", title: "Doctor appointment", time: "11:30 AM", period: "Afternoon", completed: false, dismissed: false, icon: "📅" },
  { id: "4", title: "Electricity bill (Due tomorrow)", time: "Evening", period: "Evening", completed: false, dismissed: false, icon: "💳" },
];

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sahaara_tasks");
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sahaara_tasks", JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const completeTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: true } : t)));
  };

  const dismissTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, dismissed: true } : t)));
  };

  const resetTasks = () => setTasks(mockTasks);

  return (
    <TasksContext.Provider value={{ tasks, completeTask, dismissTask, resetTasks }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}

