import React from 'react';
import { Outlet } from 'react-router-dom';
import ProjectVersionSidebar from './ProjectVersionSidebar';

/**
 * Shared layout for /projects, /projects/:id, /projects/:projectId/versions/:versionId.
 * Sidebar stays mounted so navigation between project/version feels instant (no full refresh).
 */
export default function ProjectsLayout() {
  return (
    <div className="flex min-h-full">
      <ProjectVersionSidebar />
      <div className="flex-1 lg:ml-64 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
