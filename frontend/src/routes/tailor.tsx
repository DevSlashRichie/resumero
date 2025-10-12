import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tailor')({
  component: Tailor,
});

function Tailor() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Tailor Resume</h1>
      <p>This is where you will tailor your resume.</p>
    </div>
  );
}
