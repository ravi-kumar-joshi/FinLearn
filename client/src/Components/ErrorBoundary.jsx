import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches React component errors and displays a fallback UI
 * Prevents entire app crashes from single component failures
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true, error: _error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ error, errorInfo });
        // Log error to an external service if needed
    }

    resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-8 max-w-md w-full">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-center text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page or go back to the home page.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                                <p className="text-xs font-mono text-red-600 break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={this.resetError}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-all duration-200"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
