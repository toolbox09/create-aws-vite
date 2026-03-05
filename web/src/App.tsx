import { Routes, Route, Link, useLocation } from "react-router-dom";
import CounterPage from "./pages/counter-page";
import FilesPage from "./pages/files-page";

function Nav() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/counters", label: "Counters" },
    { to: "/files", label: "Files" },
  ];

  return (
    <nav className="border-b">
      <div className="max-w-2xl mx-auto px-8 flex gap-6 h-14 items-center">
        <span className="font-bold mr-auto">{"test-repo"}</span>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm hover:text-black dark:hover:text-white ${
              pathname === link.to ? "text-black dark:text-white font-medium" : "text-neutral-500"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-4">
      <h1 className="text-3xl font-bold">{"test-repo"}</h1>
      <p className="text-neutral-500">
        React + Vite + Tailwind + shadcn/ui + Zustand + TanStack Query
      </p>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Link to="/counters" className="p-6 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900">
          <h2 className="font-semibold mb-1">Counters</h2>
          <p className="text-sm text-neutral-500">Database-backed counters</p>
        </Link>
        <Link to="/files" className="p-6 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900">
          <h2 className="font-semibold mb-1">Files</h2>
          <p className="text-sm text-neutral-500">Upload & manage files (S3/MinIO)</p>
        </Link>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-neutral-500">Page not found</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/counters" element={<CounterPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
