// Dashboard Overview Page

function Dashboard({ guild }) {
  const [stats, setStats] = useState({
    members: '...',
    channels: '...',
    roles: '...',
    warnings: '...',
    tickets: '...',
    stickyMessages: '...'
  });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch guild settings
        const settingsData = await API.getGuildSettings(guild.id);
        setSettings(settingsData);
        
        // Fetch guild stats
        const response = await fetch(`/api/guilds/${guild.id}/stats`, {
          credentials: 'include'
        });
        const guildStats = await response.json();
        
        // Fetch warnings count
        const warnings = await API.getWarnings(guild.id);
        
        // Fetch tickets count
        const tickets = await API.getTickets(guild.id);
        
        // Fetch sticky messages count
        const stickyMessages = await API.getStickyMessages(guild.id);
        
        // Update stats
        setStats({
          members: guildStats.members,
          channels: guildStats.channels,
          roles: guildStats.roles,
          warnings: warnings.length,
          tickets: tickets.length,
          stickyMessages: stickyMessages.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (guild) {
      fetchData();
    }
  }, [guild]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Parse enabled features
  const enabledFeatures = settings && settings.enabled_features ? JSON.parse(settings.enabled_features) : {};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Server Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <i className="fas fa-users text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Members</h3>
                <p className="text-2xl font-bold text-blue-700">{stats.members}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <i className="fas fa-hashtag text-purple-600"></i>
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-900">Channels</h3>
                <p className="text-2xl font-bold text-purple-700">{stats.channels}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <i className="fas fa-tags text-green-600"></i>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900">Roles</h3>
                <p className="text-2xl font-bold text-green-700">{stats.roles}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Bot Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <i className="fas fa-shield-halved text-red-600"></i>
                </div>
                <h3 className="font-medium">Moderation</h3>
              </div>
              <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{stats.warnings} warnings issued</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <i className="fas fa-ticket text-yellow-600"></i>
                </div>
                <h3 className="font-medium">Tickets</h3>
              </div>
              <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{stats.tickets} tickets created</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="fas fa-thumbtack text-blue-600"></i>
                </div>
                <h3 className="font-medium">Sticky Messages</h3>
              </div>
              <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Enabled
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{stats.stickyMessages} active sticky messages</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = '#moderation'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-red-100 p-2 rounded-full">
              <i className="fas fa-shield-halved text-red-600"></i>
            </div>
            <div className="text-left">
              <h3 className="font-medium">Manage Moderation</h3>
              <p className="text-sm text-gray-600">Configure warnings, bans, and more</p>
            </div>
          </button>
          
          <button 
            onClick={() => window.location.href = '#embed-builder'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-purple-100 p-2 rounded-full">
              <i className="fas fa-palette text-purple-600"></i>
            </div>
            <div className="text-left">
              <h3 className="font-medium">Create Embed</h3>
              <p className="text-sm text-gray-600">Design and send custom embeds</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}