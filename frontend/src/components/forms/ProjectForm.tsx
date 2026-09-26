import { Button } from "./../ui/Button";
import { Input } from "./../ui/Input";

export const ProjectForm = () => (
  <form className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Project name</label>
      <Input placeholder="Project name" />
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
      <textarea className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" rows={4} placeholder="Project description" />
    </div>
    <Button type="submit">Save project</Button>
  </form>
);
