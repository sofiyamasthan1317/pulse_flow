import { Button } from "./../ui/Button";
import { Input } from "./../ui/Input";

export const LoginForm = () => (
  <form className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
      <Input type="email" placeholder="name@example.com" />
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
      <Input type="password" placeholder="••••••••" />
    </div>
    <Button type="submit" className="w-full">
      Sign in
    </Button>
  </form>
);
