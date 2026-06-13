import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { lessons } from "@/lessons/registry";

export default function HomePage() {
  return (
    <AppShell>
      <header className="page-heading">
        <p className="lesson-kicker">Course</p>
        <h1>JS 2D ECS 游戏引擎</h1>
        <p className="copy">
          每个阶段都有独立课程页面，demo 直接消费 packages/engine 的真实 API。
        </p>
      </header>
      <section className="home-grid" aria-label="Lesson list">
        {lessons.map((lesson) => (
          <Link className="lesson-card" href={`/lessons/${lesson.slug}`} key={lesson.slug}>
            <strong>
              {lesson.number}. {lesson.title}
            </strong>
            <p>{lesson.summary}</p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
