// Login Page Component

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for error message
    const errorMsg = urlParams.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      // Clear the error from URL
      window.history.replaceState({}, '', '/');
    }

    // Check for success message
    const successMsg = urlParams.get('message');
    if (successMsg) {
      setMessage(decodeURIComponent(successMsg));
      // Clear the message from URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleLogin = (e) => {
    // Clear any existing messages
    setError(null);
    setMessage(null);
    
    // Check for required browser features
    if (!navigator.cookieEnabled) {
      setError('Please enable cookies to use the dashboard');
      return;
    }

    try {
      // Show loading state
      setLoading(true);
      
      // Store current time to detect timeouts
      sessionStorage.setItem('loginStarted', Date.now());
      
      // The actual redirect will happen automatically
      console.log('Starting Discord auth redirect...');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to start login process. Please check your browser settings.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white">Sylo Dashboard</h1>
          <p className="mt-2 text-indigo-200">Manage your Discord bot settings</p>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            {message && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-green-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Welcome to the Sylo Bot Dashboard! Login with your Discord account to manage your server's bot settings.
            </p>
            
            <a
              href="/auth/discord"
              onClick={handleLogin}
              className={`inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 w-full ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <React.Fragment>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Connecting to Discord...</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <i className="fab fa-discord mr-2"></i>
                  <span>Login with Discord</span>
                </React.Fragment>
              )}
            </a>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>You'll need to have the <strong>Manage Server</strong> permission in your Discord server.</p>
              <p className="mt-2">The bot must also be a member of your server.</p>
              <div className="mt-4 text-xs bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Troubleshooting Tips</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Enable cookies in your browser settings</li>
                  <li>Allow pop-ups for Discord authentication</li>
                  <li>Use a modern browser (Chrome, Firefox, Edge)</li>
                  <li>Try clearing your browser cache and cookies</li>
                  <li>Disable any ad blockers for this site</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}