// Guild Selector Component

function GuildSelector({ guilds, selectedGuild, setSelectedGuild }) {
  if (!guilds || guilds.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-triangle text-yellow-400"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No available servers found. Make sure the bot is added to your servers and you have the MANAGE_GUILD permission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleGuildChange = (e) => {
    const guildId = e.target.value;
    const guild = guilds.find(g => g.id === guildId);
    setSelectedGuild(guild);
  };

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="guild-select" className="font-medium text-gray-700">Select Server:</label>
      <select
        id="guild-select"
        className="form-select bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={selectedGuild && selectedGuild.id ? selectedGuild.id : ''}
        onChange={handleGuildChange}
      >
        <option value="">Select a server</option>
        {guilds.map(guild => (
          <option key={guild.id} value={guild.id}>
            {guild.name}
          </option>
        ))}
      </select>
      
      {selectedGuild && selectedGuild.id && (
        <div className="flex items-center space-x-2">
          {selectedGuild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
              alt={(selectedGuild.name || 'Server') + ' icon'}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {(selectedGuild.name || 'S').charAt(0)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}