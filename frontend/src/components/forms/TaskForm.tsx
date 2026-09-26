import { Button } from "./../ui/Button";
import { Input } from "./../ui/Input";

export const TaskForm = () => (
  <form className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Task title</label>
      <Input placeholder="Task title" />
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Assignee</label>
      <Input placeholder="Assignee" />
    </div>
    <Button type="submit">Save task</Button>
  </form>
);
