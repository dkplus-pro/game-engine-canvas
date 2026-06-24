import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "霓虹桌球 | Game Engine Canvas",
  description: "使用 packages/engine 构建的全屏 Canvas 桌球课程项目。"
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
