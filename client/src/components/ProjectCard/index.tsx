import { Project } from "@/state/api";
import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

type Props = {
  project: Project;
};

const ProjectCard = ({ project }: Props) => {
  const formattedStart = project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "";
  const formattedEnd = project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "";

  return (
    <Card variant="glass" className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <h3 className="text-base font-semibold text-foreground tracking-tight mb-2">
          {project.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || "No description provided."}
        </p>
        {(formattedStart || formattedEnd) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formattedStart} - {formattedEnd}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
