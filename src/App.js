import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import React, { Fragment } from 'react';

const electron = window.require('electron');
const { ipcRenderer } = electron;

function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const download = async (url) => {
    ipcRenderer.send('START_DOWNLOAD_VIA_MAIN', {
      url: url
    });
  };

  const handleSearch = async () => {
    ipcRenderer.send('START_SEARCH_VIA_MAIN', {
      search: searchQuery
    });
  };

  useEffect(() => {
    ipcRenderer.on('MESSAGE_FROM_BACKGROUND_VIA_MAIN', (event, message) => {
      try {
        const parsedData = JSON.parse(message); // Parse the JSON

        if (parsedData.type === 'SEARCH_RESULT') {
          setSearchResults(parsedData.data.results);
        } else if (parsedData.type === 'DOWNLOAD_RESULT') {
          console.log(parsedData.data);
        }
      } catch (error) {
          console.log(message);
      }
		});

		// ipcRenderer.send('START_UPDATE_VIA_MAIN');
  }, []);


  return (
    <Fragment>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="button" onClick={handleSearch}>Search</button>
        {searchResults.length > 0 ? (
          <div style={{ overflowY: 'auto' }}>
            {/* Render your results here */}
            {searchResults.map((result, index) => (
              <div key={index} style={{ border: '1px black solid', display: 'flex', height: "144px", marginBottom: '15px'}}>
                {/* Display your result data */}
                <div style={{ width: '256px' }}>
                  <img src={result.thumbnail} alt={result.title} style={{ height: '100%', width: '256px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', marginLeft: '10px', width: '100%' }}>
                  <div style={{ width: '100%' }}>
                    {result.title}
                  </div>
                  <div style={{ flexGrow: 1 }} /> {/* This div takes up the remaining space */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                        Duration:
                        {result.duration}
                      </div>
                      <div style={{ alignItems: 'center', display: 'flex' }}>
                        <p>Download: </p>
                        <button type="button" style={{height: "100%"}} onClick={download.bind(this, result.link)}>Download</button>
                      </div>
                  </div>
                </div>

              </div>

            ))}
          </div>
        ) : (
          <p>No results</p>
        )}
    </Fragment>
  );
}

export default App;
