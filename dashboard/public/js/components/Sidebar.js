// Sidebar Component

function Sidebar({ currentPage, navigateTo }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'moderation', label: 'Moderation', icon: 'fa-shield-halved' },
    { id: 'tickets', label: 'Ticket System', icon: 'fa-ticket' },
    { id: 'reaction-roles', label: 'Reaction Roles', icon: 'fa-tags' },
    { id: 'sticky-messages', label: 'Sticky Messages', icon: 'fa-thumbtack' },
    { id: 'utilities', label: 'Utilities', icon: 'fa-wrench' },
    { id: 'embed-builder', label: 'Embed Builder', icon: 'fa-palette' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-8 pt-4 border-t border-gray-700">
        <a 
          href="https://github.com/your-username/Sylo---Simple-multifunctional-Discord-Bot" 
          target="_blank"
          className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          <i className="fab fa-github w-5"></i>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
}