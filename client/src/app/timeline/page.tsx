"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { format } from "date-fns";
import { Calendar, Clock, Flag, LayoutGrid, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  if (isLoading) {
    return (
      <div className="h-full w-full px-6 py-8">
        <Skeleton className="h-12 w-1/3 mb-10" />
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (isError || !projects) {
    return (
      <div className="h-full w-full px-6 py-8 flex items-center justify-center">
        <div className="p-8 text-center text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20">
          An error occurred while fetching projects timeline.
        </div>
      </div>
    );
  }

  // Sort projects by start date
  const sortedProjects = [...projects]
    .filter((p) => p.startDate)
    .sort((a, b) => new Date(a.startDate as string).getTime() - new Date(b.startDate as string).getTime());

  return (
    <div className="h-full w-full px-6 py-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <Header name="Project Journey Map" />
        <p className="text-muted-foreground mt-2">A chronological overview of all your team's initiatives and milestones.</p>
      </header>

      {sortedProjects.length === 0 ? (
        <div className="text-center p-12 bg-muted/20 border border-border rounded-xl">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No Active Timelines</h3>
          <p className="text-muted-foreground mt-1">Projects with start dates will appear here chronologically.</p>
        </div>
      ) : (
        <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
          {sortedProjects.map((project, index) => {
            const startDate = project.startDate ? new Date(project.startDate) : null;
            const endDate = project.endDate ? new Date(project.endDate) : null;
            const isCompleted = endDate && endDate < new Date();
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                key={project._id || project.id || index} 
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8 last:mb-0"
              >
                {/* Timeline Icon Marker */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 fill-current" />}
                </div>
                
                {/* Timeline Card */}
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow duration-300 bg-card/60 backdrop-blur-sm border-border overflow-hidden group-hover:border-primary/30">
                  <div className={`h-1.5 w-full ${isCompleted ? 'bg-primary' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} />
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <LayoutGrid className="w-4 h-4 text-primary" />
                          <h3 className="font-bold text-lg text-foreground tracking-tight leading-tight">{project.name}</h3>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{project.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-foreground">
                          {startDate ? format(startDate, "MMM d, yyyy") : "TBD"}
                        </span>
                      </div>
                      
                      {endDate && (
                        <>
                          <span className="text-muted-foreground hidden sm:inline">→</span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Flag className="w-4 h-4" />
                            <span className="font-medium text-foreground">
                              {format(endDate, "MMM d, yyyy")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timeline;
