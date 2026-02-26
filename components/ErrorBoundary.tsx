import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto border-2 border-orange-500 flex items-center justify-center">
              <span className="text-orange-500 text-4xl font-black">!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
              משהו השתבש
            </h1>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              אירעה שגיאה בלתי צפויה. אנא רעננו את הדף ונסו שוב.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-orange-600 text-white font-black uppercase text-sm tracking-wider hover:bg-orange-500 transition-colors"
            >
              רענן דף
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}