import React from "react";
export class ErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="error-screen" dir="rtl"><h1>حدث خطأ غير متوقع</h1><p>بياناتك المحفوظة محلياً لم تُحذف. أعد تحميل الصفحة.</p><button onClick={() => location.reload()}>إعادة التحميل</button></main>;
    return this.props.children;
  }
}