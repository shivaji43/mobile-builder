"use client"

import * as React from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config/config";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the Project type based on your schema
interface Project {
  id: string
  description: string
  createdAt: string
  updatedAt: string
  userId: string
}

export function ProjectSidebar() {
  const [isHovering, setIsHovering] = React.useState(false)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { getToken } = useAuth()

  // Fetch projects when component mounts
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)

        // Get the token asynchronously
        const token = await getToken()

        if (!token) {
          throw new Error("Authentication token not available")
        }

        const response = await axios.get(`${BACKEND_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Handle the response - convert to array if it's a single project
        let projectsData = response.data;
        
        // If response is a single project object (not an array), put it in an array
        if (projectsData && !Array.isArray(projectsData) && projectsData.id) {
          projectsData = [projectsData];
        } 
        // Handle other common response structures
        else if (projectsData && typeof projectsData === "object" && !Array.isArray(projectsData)) {
          if (projectsData.data && Array.isArray(projectsData.data)) {
            projectsData = projectsData.data;
          } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
            projectsData = projectsData.projects;
          } else if (projectsData.results && Array.isArray(projectsData.results)) {
            projectsData = projectsData.results;
          }
        }

        // Ensure we have an array before proceeding
        if (!Array.isArray(projectsData)) {
          console.error("API response could not be processed:", projectsData);
          throw new Error("Unexpected API response format");
        }

        setProjects(projectsData);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getToken]);

  // Handle mouse enter/leave for the hover area
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <>
      {/* Hover trigger area */}
      <div className="fixed left-0 top-0 h-full w-4 z-40" onMouseEnter={handleMouseEnter} aria-hidden="true" />

      <SidebarProvider>
        <Sidebar
          className={`transition-all font-sans duration-300 ease-in-out ${isHovering ? "translate-x-0" : "-translate-x-full"}`}
          onMouseLeave={handleMouseLeave}
        >
          <SidebarHeader className="border-b p-6">
            <h2 className="text-pink-700 text-xl font-semibold">Your Projects</h2>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              {loading ? (
                <div className="p-4 text-center">Loading projects...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : projects.length === 0 ? (
                <div className="p-4 text-center">No projects found</div>
              ) : (
                <div className="space-y-4 p-4">
                  {projects.map((project) => (
                    <div key={project.id} className="rounded-lg border p-4 hover:bg-sidebar-accent transition-colors">
                      <p className="font-medium">{project.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </>
  )
}