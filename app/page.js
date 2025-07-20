export default function Home() {
  return (
    <main>
      <h1>Welcome to the Bot-Protected Site</h1>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.cookie = "js_enabled=1; path=/";`,
        }}
      />
    </main>
  );
}
