// Moderation Page Component

function Moderation({ guild }) {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState('warn');
  const [duration, setDuration] = useState('60'); // Default 1 hour for timeout
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchWarnings() {
      try {
        const warningsData = await API.getWarnings(guild.id);
        setWarnings(warningsData);
      } catch (error) {
        console.error('Error fetching warnings:', error);
        setErrorMessage('Failed to load warnings');
      } finally {
        setLoading(false);
      }
    }

    if (guild) {
      fetchWarnings();
    }
  }, [guild]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!userId) {
      setErrorMessage('User ID is required');
      return;
    }

    try {
      switch (actionType) {
        case 'warn':
          await API.addWarning(guild.id, userId, {
            reason,
            moderator_id: 'dashboard' // In a real implementation, this would be the actual moderator's ID
          });
          setSuccessMessage(`Warning added for user ${userId}`);
          // Refresh warnings
          const warningsData = await API.getWarnings(guild.id);
          setWarnings(warningsData);
          break;
          
        case 'ban':
          await API.banUser(guild.id, { userId, reason });
          setSuccessMessage(`User ${userId} has been banned`);
          break;
          
        case 'kick':
          await API.kickUser(guild.id, { userId, reason });
          setSuccessMessage(`User ${userId} has been kicked`);
          break;
          
        case 'timeout':
          await API.timeoutUser(guild.id, { userId, reason, duration });
          setSuccessMessage(`User ${userId} has been timed out for ${duration} minutes`);
          break;
          
        default:
          break;
      }

      // Clear form
      setUserId('');
      setReason('');
    } catch (error) {
      console.error('Error performing moderation action:', error);
      setErrorMessage('Failed to perform action');
    }
  };

  const handleRemoveWarning = async (warningId) => {
    try {
      await API.removeWarning(guild.id, warningId);
      setSuccessMessage('Warning removed successfully');
      
      // Update warnings list
      setWarnings(warnings.filter(warning => warning.id !== warningId));
    } catch (error) {
      console.error('Error removing warning:', error);
      setErrorMessage('Failed to remove warning');
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
        <h2 className="text-2xl font-bold mb-4">Moderation Actions</h2>
        
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
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 form-input"
              placeholder="Enter Discord user ID"
            />
          </div>
          
          <div>
            <label htmlFor="actionType" className="block text-sm font-medium text-gray-700">Action</label>
            <select
              id="actionType"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="mt-1 form-select"
            >
              <option value="warn">Warn</option>
              <option value="ban">Ban</option>
              <option value="kick">Kick</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
          
          {actionType === 'timeout' && (
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 form-input"
                min="1"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 form-input"
              rows="3"
              placeholder="Enter reason for this action"
            ></textarea>
          </div>
          
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Warning History</h2>
        
        {warnings.length === 0 ? (
          <p className="text-gray-500">No warnings found for this server.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warnings.map(warning => (
                  <tr key={warning.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{warning.user_id}</td>
                    <td className="px-6 py-4">{warning.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(warning.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveWarning(warning.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
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