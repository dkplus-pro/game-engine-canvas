export default function NotFound() {
  const homePath = process.env.NEXT_PUBLIC_BASE_PATH || "/";

  return (
    <main className="billiards-app" aria-label="页面未找到">
      <section className="billiards-panel">
        <p className="billiards-panel__kicker">404</p>
        <h1>球桌未找到</h1>
        <p>这个课程应用只有一个桌球页面，请返回根路径重新开球。</p>
        <div className="billiards-panel__footer">
          <a className="billiards-button billiards-button--primary" href={homePath}>
            返回球桌
          </a>
        </div>
      </section>
    </main>
  );
}
