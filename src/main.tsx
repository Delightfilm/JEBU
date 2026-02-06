import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false as boolean, error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "#b91c1c" }}>오류가 발생했습니다</h1>
          <pre style={{ background: "#fef2f2", padding: "1rem", overflow: "auto", fontSize: "12px" }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: "#666", marginTop: "1rem" }}>
            개발자 도구(F12) 콘솔에서 상세 내용을 확인할 수 있습니다.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
