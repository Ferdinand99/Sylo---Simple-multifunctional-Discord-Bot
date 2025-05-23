// Reaction Roles Page Component

function ReactionRoles({ guild }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [messageId, setMessageId] = useState('');
  const [emoji, setEmoji] = useState('');
  const [exclusive, setExclusive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchRoles() {
      try {
        const rolesData = await API.getReactionRoles(guild.id);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching reaction roles:', error);
        setErrorMessage('Failed to load reaction roles');
      } finally {
        setLoading(false);
      }
    }

    if (guild) {
      fetchRoles();
    }
  }, [guild]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!messageId || !selectedRole || !emoji) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      await API.addReactionRole(guild.id, {
        message_id: messageId,
        role_id: selectedRole,
        emoji,
        exclusive
      });

      // Refresh roles list
      const rolesData = await API.getReactionRoles(guild.id);
      setRoles(rolesData);

      // Clear form
      setMessageId('');
      setSelectedRole('');
      setEmoji('');
      setExclusive(false);

      setSuccessMessage('Reaction role added successfully!');
    } catch (error) {
      console.error('Error adding reaction role:', error);
      setErrorMessage('Failed to add reaction role');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Reaction Roles</h2>
        
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="messageId" className="block text-sm font-medium text-gray-700">Message ID</label>
            <input
              type="text"
              id="messageId"
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              className="form-input"
              placeholder="Enter message ID"
            />
          </div>
          
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="roleId"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-select"
            >
              <option value="">Select a role</option>
              {/* Role options would be populated from Discord API */}
            </select>
          </div>
          
          <div>
            <label htmlFor="emoji" className="block text-sm font-medium text-gray-700">Emoji</label>
            <input
              type="text"
              id="emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="form-input"
              placeholder="Enter emoji (e.g., 👍 or :thumbsup:)"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="exclusive"
              checked={exclusive}
              onChange={(e) => setExclusive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="exclusive" className="ml-2 block text-sm text-gray-700">
              Exclusive (users can only have one role from this menu)
            </label>
          </div>
          
          <button
            type="submit"
            className="form-button"
          >
            Add Reaction Role
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Current Reaction Roles</h2>
        
        {roles.length === 0 ? (
          <p className="text-gray-500">No reaction roles configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emoji</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map(role => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{role.message_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{role.role_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{role.emoji}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {role.exclusive ? 'Exclusive' : 'Multiple'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}