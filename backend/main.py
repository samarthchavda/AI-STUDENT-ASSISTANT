"""
Main entry point for the FastAPI backend server.
Run with: python3 main.py
"""
import uvicorn
import signal
import sys

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print('\n\n🛑 Shutting down server...')
    sys.exit(0)

if __name__ == "__main__":
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("🚀 Starting FastAPI server...")
    print("📍 Server running at: http://localhost:8000")
    print("📚 API docs at: http://localhost:8000/docs")
    print("⚠️  Press Ctrl+C to stop\n")
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print('\n\n🛑 Server stopped by user')
        sys.exit(0)
