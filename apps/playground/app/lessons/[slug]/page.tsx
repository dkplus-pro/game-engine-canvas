import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LessonPage } from "@/components/lesson-page";
import { getLesson, lessons } from "@/lessons/registry";

interface LessonRouteProps {
  readonly params: Promise<{
    readonly slug: string;
  }>;
}

export function generateStaticParams() {
  return lessons.map((lesson) => ({
    slug: lesson.slug
  }));
}

export async function generateMetadata({ params }: LessonRouteProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);

  return {
    title: lesson ? `${lesson.title} | Game Engine Canvas` : "Lesson"
  };
}

export default async function LessonRoute({ params }: LessonRouteProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <AppShell>
      <LessonPage lesson={lesson} />
    </AppShell>
  );
}
