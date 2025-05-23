// Navbar Component

function Navbar({ user }) {
  console.log('Navbar rendering with user:', user);

  if (!user) {
    console.log('User is null/undefined in Navbar');
    return (
      <nav className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Sylo Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/auth/discord"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Login with Discord
            </a>
          </div>
        </div>
      </nav>
    );
  }

  // Safely access user properties
  const avatar = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png';
  const username = user.username || 'Discord User';

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Sylo Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                alt={user.username ? `${user.username}'s Avatar` : 'User Avatar'}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                }}
              />
              <span className="font-medium">{user.username || 'Discord User'}</span>
              <a 
                href="/auth/logout" 
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Logout
              </a>
            </div>
          ) : (
            <a 
              href="/auth/discord" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Login with Discord
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}