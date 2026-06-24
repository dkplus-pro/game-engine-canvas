import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "坦克大战 90 | Game Engine Canvas",
  description: "使用 packages/engine 构建的全屏 Canvas 复古坦克大战课程项目。"
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
