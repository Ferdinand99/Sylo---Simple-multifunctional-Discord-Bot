// Embed Builder Component

function EmbedBuilder({ guild }) {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Embed state
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [embedColor, setEmbedColor] = useState('#5865F2'); // Discord blue
  const [embedAuthor, setEmbedAuthor] = useState('');
  const [embedAuthorIcon, setEmbedAuthorIcon] = useState('');
  const [embedFooter, setEmbedFooter] = useState('');
  const [embedFooterIcon, setEmbedFooterIcon] = useState('');
  const [embedThumbnail, setEmbedThumbnail] = useState('');
  const [embedImage, setEmbedImage] = useState('');
  const [embedFields, setEmbedFields] = useState([{ name: '', value: '', inline: false }]);

  // Fetch channels when guild changes
  useEffect(() => {
    async function fetchChannels() {
      try {
        setLoading(true);
        const response = await fetch(`/api/guilds/${guild.id}/channels`, {
          credentials: 'include'
        });

        if (response.ok) {
          const channelsData = await response.json();
          setChannels(channelsData);
        } else {
          setErrorMessage('Failed to fetch channels');
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setErrorMessage('Failed to fetch channels');
      } finally {
        setLoading(false);
      }
    }

    if (guild) {
      fetchChannels();
    }
  }, [guild]);

  const handleAddField = () => {
    setEmbedFields([...embedFields, { name: '', value: '', inline: false }]);
  };

  const handleRemoveField = (index) => {
    const newFields = [...embedFields];
    newFields.splice(index, 1);
    setEmbedFields(newFields);
  };

  const handleFieldChange = (index, field) => {
    const newFields = [...embedFields];
    newFields[index] = field;
    setEmbedFields(newFields);
  };

  const handleSendEmbed = async () => {
    if (!selectedChannel) {
      setErrorMessage('Please select a channel');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Construct embed object
      const embed = {
        title: embedTitle,
        description: embedDescription,
        color: parseInt(embedColor.replace('#', ''), 16),
        author: embedAuthor ? {
          name: embedAuthor,
          icon_url: embedAuthorIcon || undefined
        } : undefined,
        footer: embedFooter ? {
          text: embedFooter,
          icon_url: embedFooterIcon || undefined
        } : undefined,
        thumbnail: embedThumbnail ? { url: embedThumbnail } : undefined,
        image: embedImage ? { url: embedImage } : undefined,
        fields: embedFields.filter(field => field.name && field.value)
      };

      // Send embed to API
      await API.sendEmbed(guild.id, {
        channelId: selectedChannel,
        embed
      });

      setSuccessMessage('Embed sent successfully!');
    } catch (error) {
      console.error('Error sending embed:', error);
      setErrorMessage('Failed to send embed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Embed Builder</h2>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Embed Settings</h3>
            
            <div>
              <label htmlFor="embedTitle" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="embedTitle"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                className="mt-1 form-input"
                placeholder="Embed title"
              />
            </div>
            
            <div>
              <label htmlFor="embedDescription" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="embedDescription"
                value={embedDescription}
                onChange={(e) => setEmbedDescription(e.target.value)}
                className="mt-1 form-input"
                rows="4"
                placeholder="Embed description"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="embedColor" className="block text-sm font-medium text-gray-700">Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="embedColor"
                  value={embedColor}
                  onChange={(e) => setEmbedColor(e.target.value)}
                  className="mt-1"
                />
                <input
                  type="text"
                  value={embedColor}
                  onChange={(e) => setEmbedColor(e.target.value)}
                  className="mt-1 form-input"
                  placeholder="#5865F2"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="embedAuthor" className="block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                id="embedAuthor"
                value={embedAuthor}
                onChange={(e) => setEmbedAuthor(e.target.value)}
                className="mt-1 form-input"
                placeholder="Author name"
              />
            </div>
            
            <div>
              <label htmlFor="embedAuthorIcon" className="block text-sm font-medium text-gray-700">Author Icon URL</label>
              <input
                type="text"
                id="embedAuthorIcon"
                value={embedAuthorIcon}
                onChange={(e) => setEmbedAuthorIcon(e.target.value)}
                className="mt-1 form-input"
                placeholder="https://example.com/icon.png"
              />
            </div>
            
            <div>
              <label htmlFor="embedFooter" className="block text-sm font-medium text-gray-700">Footer</label>
              <input
                type="text"
                id="embedFooter"
                value={embedFooter}
                onChange={(e) => setEmbedFooter(e.target.value)}
                className="mt-1 form-input"
                placeholder="Footer text"
              />
            </div>
            
            <div>
              <label htmlFor="embedFooterIcon" className="block text-sm font-medium text-gray-700">Footer Icon URL</label>
              <input
                type="text"
                id="embedFooterIcon"
                value={embedFooterIcon}
                onChange={(e) => setEmbedFooterIcon(e.target.value)}
                className="mt-1 form-input"
                placeholder="https://example.com/icon.png"
              />
            </div>
            
            <div>
              <label htmlFor="embedThumbnail" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
              <input
                type="text"
                id="embedThumbnail"
                value={embedThumbnail}
                onChange={(e) => setEmbedThumbnail(e.target.value)}
                className="mt-1 form-input"
                placeholder="https://example.com/thumbnail.png"
              />
            </div>
            
            <div>
              <label htmlFor="embedImage" className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                id="embedImage"
                value={embedImage}
                onChange={(e) => setEmbedImage(e.target.value)}
                className="mt-1 form-input"
                placeholder="https://example.com/image.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
              
              {embedFields.map((field, index) => (
                <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Field {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleFieldChange(index, { ...field, name: e.target.value })}
                      className="form-input w-full"
                      placeholder="Field name"
                    />
                    
                    <textarea
                      value={field.value}
                      onChange={(e) => handleFieldChange(index, { ...field, value: e.target.value })}
                      className="form-input w-full"
                      rows="2"
                      placeholder="Field value"
                    ></textarea>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`inline-${index}`}
                        checked={field.inline}
                        onChange={(e) => handleFieldChange(index, { ...field, inline: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`inline-${index}`} className="ml-2 block text-sm text-gray-700">
                        Inline
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddField}
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <i className="fas fa-plus mr-1"></i> Add Field
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview & Send</h3>
            
            <div className="mb-4">
              <label htmlFor="channelSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Channel</label>
              <select
                id="channelSelect"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="form-select"
              >
                <option value="">Select a channel</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4 p-4 bg-gray-800 rounded-md">
              <div className="discord-embed" style={{ borderLeftColor: embedColor }}>
                {embedAuthor && (
                  <div className="flex items-center mb-2">
                    {embedAuthorIcon && (
                      <img src={embedAuthorIcon} alt="Author Icon" className="w-6 h-6 rounded-full mr-2" />
                    )}
                    <span className="text-white text-sm">{embedAuthor}</span>
                  </div>
                )}
                
                {embedTitle && (
                  <div className="discord-embed-title">{embedTitle}</div>
                )}
                
                {embedDescription && (
                  <div className="discord-embed-description whitespace-pre-wrap">{embedDescription}</div>
                )}
                
                {embedFields.length > 0 && embedFields.some(field => field.name && field.value) && (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {embedFields.map((field, index) => (
                      field.name && field.value ? (
                        <div key={index} className="">
                          <div className="text-white text-xs font-semibold">{field.name}</div>
                          <div className="text-gray-300 text-xs">{field.value}</div>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
                
                {(embedFooter || embedImage || embedThumbnail) && (
                  <div className="mt-2">
                    {embedImage && (
                      <div className="mt-2 mb-2">
                        <img src={embedImage} alt="Embed Image" className="max-w-full rounded" />
                      </div>
                    )}
                    
                    {embedThumbnail && (
                      <div className="float-right ml-2">
                        <img src={embedThumbnail} alt="Thumbnail" className="w-16 h-16 rounded" />
                      </div>
                    )}
                    
                    {embedFooter && (
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        {embedFooterIcon && (
                          <img src={embedFooterIcon} alt="Footer Icon" className="w-4 h-4 rounded-full mr-2" />
                        )}
                        <span>{embedFooter}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSendEmbed}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <React.Fragment>
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span>Send Embed</span>
                </React.Fragment>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}