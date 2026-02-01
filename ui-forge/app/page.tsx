import { auth } from '@/libs/auth';
import { redirect } from 'next/navigation';
import UICodeGenerator from '@/components/UICodeGenerator';
import { getUserProjects } from '@/app/actions/project-actions';

export default async function HomePage() {
  // 1. Auth Check
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  // 2. Fetch Real Data from Database
  // This runs on the server, so it's instant and secure.
  const projects = await getUserProjects();

  // 3. Pass data to the Client Component
  // We pass 'projects' so the UI doesn't start empty.
  // We pass 'user' so the UI knows who we are.
  return <UICodeGenerator initialProjects={projects as any} user={session.user} />;
}