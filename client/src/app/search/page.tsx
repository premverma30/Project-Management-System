"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 500),
    []
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="px-6 py-8">
      <Header name="Search" />
      
      <div className="relative mt-6 max-w-xl">
        <SearchIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, tasks, or users..."
          className="flex h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          onChange={handleSearch}
        />
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} variant="glass" className="h-[120px]">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {isError && (
          <div className="p-8 text-center text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20">
            Error occurred while fetching search results.
          </div>
        )}

        {!isLoading && !isError && searchResults && (
          <div className="space-y-8">
            {/* TASKS */}
            {searchResults.tasks && searchResults.tasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground tracking-tight pl-1">Tasks</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.tasks.map((task) => (
                    <TaskCard key={task._id || task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {searchResults.projects && searchResults.projects.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground tracking-tight pl-1">Projects</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.projects.map((project) => (
                    <ProjectCard key={project._id || project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {/* USERS */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground tracking-tight pl-1">Users</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.users.map((user) => (
                    <UserCard key={user._id || user.userId} user={user} />
                  ))}
                </div>
              </div>
            )}

            {(!searchResults.tasks?.length && !searchResults.projects?.length && !searchResults.users?.length && searchTerm.length >= 3) && (
              <div className="p-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-border">
                No results found matching "{searchTerm}".
              </div>
            )}
          </div>
        )}

        {searchTerm.length < 3 && !isLoading && (
          <div className="p-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-border">
            Type at least 3 characters to search projects, tasks, and users.
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
