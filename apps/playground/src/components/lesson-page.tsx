import type { Lesson } from "@/lessons/types";

export function LessonPage({ lesson }: { readonly lesson: Lesson }) {
  const Demo = lesson.component;

  return (
    <div className="lesson-layout">
      <header className="page-heading">
        <p className="lesson-kicker">Lesson {lesson.number}</p>
        <h1>{lesson.title}</h1>
        <p className="copy">{lesson.summary}</p>
      </header>
      <div className="lesson-frame">
        <Demo />
      </div>
    </div>
  );
}
