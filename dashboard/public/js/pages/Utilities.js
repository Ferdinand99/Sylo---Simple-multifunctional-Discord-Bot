// Utilities Page Component

function Utilities({ guild }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // List of bot commands
  const commands = [
    { name: 'help', description: 'Shows list of available commands', usage: '/help [command]' },
    { name: 'ban', description: 'Bans a user from the server', usage: '/ban @user [reason]' },
    { name: 'kick', description: 'Kicks a user from the server', usage: '/kick @user [reason]' },
    { name: 'timeout', description: 'Timeouts a user', usage: '/timeout @user [duration] [reason]' },
    { name: 'warn', description: 'Warns a user', usage: '/warn @user [reason]' },
    { name: 'warnings', description: 'Shows warnings for a user', usage: '/warnings @user' },
    { name: 'removewarning', description: 'Removes a warning from a user', usage: '/removewarning @user [warning_id]' },
    { name: 'ticket', description: 'Creates a support ticket', usage: '/ticket [topic]' },
    { name: 'say', description: 'Makes the bot say something', usage: '/say [channel] [message]' },
    { name: 'sticky', description: 'Creates a sticky message', usage: '/sticky [channel] [message]' }
  ];

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsData = await API.getGuildSettings(guild.id);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching guild settings:', error);
        setErrorMessage('Failed to load guild settings');
      } finally {
        setLoading(false);
      }
    }

    if (guild) {
      fetchSettings();
    }
  }, [guild]);

  const toggleFeature = async (feature) => {
    try {
      const enabledFeatures = settings && settings.enabled_features ?
        JSON.parse(settings.enabled_features) : {};
      const updatedFeatures = {
        ...enabledFeatures,
        [feature]: !(enabledFeatures && enabledFeatures[feature])
      };

      await API.updateGuildSettings(guild.id, {
        ...settings,
        enabled_features: JSON.stringify(updatedFeatures)
      });

      // Update local state
      setSettings({
        ...settings,
        enabled_features: JSON.stringify(updatedFeatures)
      });

      setSuccessMessage(`${feature} ${updatedFeatures[feature] ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating feature:', error);
      setErrorMessage('Failed to update feature');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
const enabledFeatures = settings && settings.enabled_features ?
  JSON.parse(settings.enabled_features) : {};


  return (
    <div className="space-y-6">
      {/* Feature toggles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Feature Settings</h2>
        
        {successMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-green-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {['moderation', 'tickets', 'reactionRoles', 'stickyMessages'].map(feature => (
            <div key={feature} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{feature.charAt(0).toUpperCase() + feature.slice(1)}</h3>
                <p className="text-sm text-gray-500">Enable or disable {feature} functionality</p>
              </div>
              <button
                onClick={() => toggleFeature(feature)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  enabledFeatures[feature] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    enabledFeatures[feature] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Commands list */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Available Commands</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Command</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commands.map(command => (
                <tr key={command.name}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    /{command.name}
                  </td>
                  <td className="px-6 py-4">
                    {command.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {command.usage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Server info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Server Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Server ID</h3>
            <p className="mt-1">{guild.id}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Mod Log Channel</h3>
            <p className="mt-1">{settings && settings.modlog_channel ? settings.modlog_channel : 'Not set'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Features</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {Object.entries(enabledFeatures).map(([feature, enabled]) => (
                enabled && (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {feature}
                  </span>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}