import Link from "next/link";
import type { ReactNode } from "react";
import { lessons } from "@/lessons/registry";

export function AppShell({ children }: { readonly children: ReactNode }) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <strong>Game Engine Canvas</strong>
          <span>2D ECS 引擎课程</span>
        </Link>
        <nav className="nav-list" aria-label="Lesson navigation">
          {lessons.map((lesson) => (
            <Link className="nav-item" href={`/lessons/${lesson.slug}`} key={lesson.slug}>
              <strong>
                {lesson.number}. {lesson.title}
              </strong>
              <span>{lesson.summary}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <section className="content">{children}</section>
    </main>
  );
}
