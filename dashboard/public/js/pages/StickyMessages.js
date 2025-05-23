// Sticky Messages Page Component
/* global React, useState, useEffect, API */
'use strict';

function StickyMessages({ guild }) {
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingChannelId, setRemovingChannelId] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#5865F2'); // Discord blue
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch channels and messages when guild changes
  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!guild || !mounted) return;

      try {
        setLoading(true);
        
        // Get channels
        const response = await fetch(`/api/guilds/${guild.id}/channels`, {
          credentials: 'include'
        });

        if (!mounted) return;

        if (response.ok) {
          const channelsData = await response.json();
          setChannels(channelsData);
        } else {
          console.error('Failed to fetch channels');
        }

        // Get sticky messages
        const messagesData = await API.getStickyMessages(guild.id);
        if (!mounted) return;
        setMessages(messagesData);
      } catch (error) {
        if (!mounted) return;
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load data');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [guild]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    if (!channelId || !content) {
      setErrorMessage('Channel and content are required');
      setLoading(false);
      return;
    }

    try {
      // Send sticky message with hex color string
      await API.setStickyMessage(guild.id, {
        channel_id: channelId,
        content,
        title,
        color: color.startsWith('#') ? color : `#${color}`
      });

      // Show success message first
      setSuccessMessage('Sticky message set successfully!');

      // Clear form
      setChannelId('');
      setContent('');
      setTitle('');
      setColor('#5865F2');

      try {
        // Refresh messages list
        console.log('Refreshing messages list...');
        const messagesData = await API.getStickyMessages(guild.id);
        setMessages(messagesData);
      } catch (refreshError) {
        console.error('Error refreshing messages:', refreshError);
        // Don't override success message, just log the refresh error
      }
    } catch (error) {
      console.error('Error setting sticky message:', error);
      // Handle API error responses
      if (error.message.includes('Guild not found')) {
        setErrorMessage('Server not found or bot is not in server');
      } else if (error.message.includes('Channel not found')) {
        setErrorMessage('Selected channel not found or inaccessible');
      } else if (error.message.includes('Failed to send message')) {
        setErrorMessage('Could not send message - Check bot permissions');
      } else {
        setErrorMessage(error.message || 'Failed to set sticky message');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (channelId) => {
    try {
      setRemovingChannelId(channelId);
      await API.removeStickyMessage(guild.id, channelId);
      setMessages(messages.filter(msg => msg.channel_id !== channelId));
      setSuccessMessage('Sticky message removed successfully');
    } catch (error) {
      console.error('Error removing sticky message:', error);
      setErrorMessage('Failed to remove sticky message');
    } finally {
      setRemovingChannelId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading sticky messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Set Sticky Message</h2>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="channelId" className="block text-sm font-medium text-gray-700">Channel <span className="text-red-500">*</span></label>
                <select
                  id="channelId"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="">Select a channel</option>
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      #{channel.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional title for the message"
                />
              </div>
              
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-9 w-9 p-0 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#5865F2"
                  />
                </div>
              </div>
            </div>

            <div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content <span className="text-red-500">*</span></label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="6"
                  placeholder="The message that will be kept at the bottom of the channel"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="bg-white rounded-md p-4 shadow-sm">
                {title && (
                  <div className="text-lg font-semibold mb-2" style={{ color }}>
                    {title}
                  </div>
                )}
                <div className="text-gray-700 whitespace-pre-wrap">
                  {content || 'Message content will appear here...'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              disabled={!channelId || !content || loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting message...
                </div>
              ) : (
                'Set Sticky Message'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Current Sticky Messages</h2>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <i className="fas fa-thumbtack fa-2x"></i>
            </div>
            <p className="text-gray-500">No sticky messages configured yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {messages.map(message => {
              const channel = channels.find(c => c.id === message.channel_id);
              return (
                <div
                  key={message.channel_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <i className="fas fa-hashtag text-gray-400"></i>
                        <h3 className="font-medium text-gray-900">
                          {channel ? channel.name : 'Unknown Channel'}
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-md p-4">
                        {message.title && (
                          <div className="text-lg font-semibold mb-2" style={{ color: message.color || '#5865F2' }}>
                            {message.title}
                          </div>
                        )}
                        <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(message.channel_id)}
                      className="ml-4 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Remove sticky message"
                      disabled={removingChannelId === message.channel_id}
                    >
                      {removingChannelId === message.channel_id ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <i className="fas fa-trash"></i>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}