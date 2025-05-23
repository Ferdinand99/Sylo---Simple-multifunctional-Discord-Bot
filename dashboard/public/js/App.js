// Main App Component

const { useState, useEffect } = React;

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', error);
    setError(error);
    setHasError(true);
    return false;
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
              {error && typeof error.toString === 'function' ? error.toString() : 'Unknown error occurred'}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check if user is logged in
  useEffect(() => {
    async function fetchUser() {
      try {
        console.log('Fetching user data...');
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        
        console.log('User response status:', response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setUser(userData);
          fetchGuilds();
        } else {
          const errorText = await response.text();
          console.error('User fetch failed:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchGuilds() {
      try {
        console.log('Fetching guilds...');
        const response = await fetch('/api/guilds', {
          credentials: 'include'
        });
        
        console.log('Guilds response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Guilds data received:', data);
          
          // Handle new response format with guilds and meta
          const guildsArray = data.guilds || [];
          setGuilds(guildsArray);
          
          if (guildsArray.length > 0 && !selectedGuild) {
            const firstGuild = guildsArray[0];
            if (firstGuild && firstGuild.id) {
              console.log('Setting initial guild:', firstGuild);
              setSelectedGuild(firstGuild);
            }
          }
          
          // Log cache status
          if (data.meta) {
            console.log('Guilds cache status:', {
              total: data.meta.total,
              filtered: data.meta.filtered,
              cached: data.meta.cached,
              lastFetch: new Date(data.meta.lastFetch)
            });
          }
        } else {
          const errorText = await response.text();
          console.error('Guilds fetch failed:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching guilds:', error);
      }
    }

    console.log('App mounted, starting data fetch...');
    fetchUser();
  }, []);

  // Handle page navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render login page if not authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Render dashboard with selected guild
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      
      <div className="flex flex-1">
        <Sidebar 
          currentPage={currentPage} 
          navigateTo={navigateTo} 
        />
        
        <div className="flex-1 p-6">
          <GuildSelector 
            guilds={guilds} 
            selectedGuild={selectedGuild} 
            setSelectedGuild={setSelectedGuild} 
          />
          
          {selectedGuild ? (
            <div className="mt-6">
              {currentPage === 'dashboard' && <Dashboard guild={selectedGuild} />}
              {currentPage === 'moderation' && <Moderation guild={selectedGuild} />}
              {currentPage === 'tickets' && <Tickets guild={selectedGuild} />}
              {currentPage === 'reaction-roles' && <ReactionRoles guild={selectedGuild} />}
              {currentPage === 'sticky-messages' && <StickyMessages guild={selectedGuild} />}
              {currentPage === 'utilities' && <Utilities guild={selectedGuild} />}
              {currentPage === 'embed-builder' && <EmbedBuilder guild={selectedGuild} />}
            </div>
          ) : (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">No Server Selected</h2>
              <p>Please select a server from the dropdown above to manage its settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}