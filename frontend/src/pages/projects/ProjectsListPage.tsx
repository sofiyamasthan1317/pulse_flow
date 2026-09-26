import { useEffect, useState } from "react";
import { projectsApi } from "../../api/projects.api";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { ProjectDeleteDialog } from "../../components/projects/ProjectDeleteDialog";
import { ProjectFormModal } from "../../components/projects/ProjectFormModal";
import { useAuth } from "../../store/auth.store";
import type { CreateProjectInput, Project, UpdateProjectInput } from "../../types/project";
import { extractErrorMessage } from "../../utils/errors";

type ProjectsListPageProps = {
  basePath: string;
};

export const ProjectsListPage = ({ basePath }: ProjectsListPageProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.listProjects();
      setProjects(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    projectsApi
      .listProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateSubmit = async (input: CreateProjectInput | UpdateProjectInput) => {
    if (projectToEdit) {
      const updated = await projectsApi.updateProject(projectToEdit.id, input);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await projectsApi.createProject(input as CreateProjectInput);
      setProjects((prev) => [created, ...prev]);
    }
  };

  const handleDeleteConfirm = async (projectId: string) => {
    await projectsApi.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const canCreate = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  // Derive known clients from loaded projects for client select option
  const knownClients = Array.from(
    new Map(
      projects
        .filter((p) => p.client?.id)
        .map((p) => [p.client!.id, { id: p.client!.id, name: p.client!.name }]),
    ).values(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track client project portfolios</p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setProjectToEdit(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : error ? (
        <div className="bg-white p-6 rounded-xl border border-red-200 text-center space-y-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => void fetchProjects()}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">No projects found.</h3>
          <p className="text-sm text-slate-500">Get started by creating your first client project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              basePath={basePath}
              onEdit={(p) => {
                setProjectToEdit(p);
                setIsFormOpen(true);
              }}
              onDelete={(p) => {
                setProjectToDelete(p);
                setIsDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        projectToEdit={projectToEdit}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateSubmit}
        existingClients={knownClients}
      />

      {/* Delete Confirmation */}
      <ProjectDeleteDialog
        isOpen={isDeleteDialogOpen}
        project={projectToDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
