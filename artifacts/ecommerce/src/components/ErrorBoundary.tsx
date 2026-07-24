import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    // Log to console so it's also visible in browser DevTools
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <div
          style={{
            fontFamily: "monospace",
            padding: "24px",
            maxWidth: "900px",
            margin: "40px auto",
            background: "#fff0f0",
            border: "2px solid #ff4444",
            borderRadius: "8px",
          }}
        >
          <h1 style={{ color: "#cc0000", fontSize: "20px", marginBottom: "8px" }}>
            💥 Runtime Error
          </h1>
          <p style={{ color: "#880000", fontSize: "15px", fontWeight: "bold", marginBottom: "16px" }}>
            {error?.message ?? "Unknown error"}
          </p>

          <details open style={{ marginBottom: "16px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#333", marginBottom: "8px" }}>
              Component Stack
            </summary>
            <pre
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "4px",
                overflowX: "auto",
                fontSize: "12px",
                color: "#333",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {errorInfo?.componentStack ?? "—"}
            </pre>
          </details>

          <details>
            <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#333", marginBottom: "8px" }}>
              JavaScript Stack Trace
            </summary>
            <pre
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "4px",
                overflowX: "auto",
                fontSize: "12px",
                color: "#333",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error?.stack ?? "—"}
            </pre>
          </details>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "8px 20px",
              background: "#cc0000",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
