import React, { useEffect ,useState } from 'react';
import axios from 'axios';
import logo from './Discord-Logo.png';
import './App.css';
//import '/discordbot/Commands/Play'

function App() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');

  useEffect(() => {
    // Make a GET request to fetch the list of channels
    axios.get('http://localhost:3001/channelsList')
      .then((response) => {
        setChannels(response.data.channels);
        console.log(response.data.channels)
      })
      .catch((error) => {
        console.error('Error fetching channels:', error);
      });
  }, []);


  const [inputValue, setInputValue] = useState('');
  const [queue, setQueue] = useState([]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddToQueue = () => {
    apiCall(inputValue.trim())
    if (inputValue.trim() !== '') {
      setQueue([...queue, inputValue]);
      setInputValue('');
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  const handleRemoveItem = (index) => {
    const updatedQueue = [...queue];
    updatedQueue.splice(index, 1);
    setQueue(updatedQueue);
  };

  const handleSelectChange = (event) => {
    setSelectedChannel(event.target.value);
  };

  const handleChangeOrder = (oldIndex, newIndex) => {
    const updatedQueue = [...queue];
    const [movedItem] = updatedQueue.splice(oldIndex, 1);
    updatedQueue.splice(newIndex, 0, movedItem);
    setQueue(updatedQueue);
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
            Controle manual de busca de música
        </p>
        <div>
          <h1>Channel List</h1>
          <label htmlFor="channelSelect">Select a channel:</label>
          <select id="channelSelect" value={selectedChannel} onChange={handleSelectChange}>
            <option value="">Select a channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          {selectedChannel && (
            <p>You selected: {channels.find((channel) => channel.id === selectedChannel)?.name}</p>
          )}
        </div>
        <input 
         className="cool-input"
         placeholder="buscar música"
         value={inputValue}
         onChange={handleInputChange}
         ></input>
         <div>
          <button className='cool-button'
          onClick={handleAddToQueue}
          >Procurar uma música</button>

          <button className='cool-button' onClick={handleClearQueue}>Limpar a fila</button>
         </div>
        {/* Display the queue */}
          {queue.length > 0 && (
            <div>
              <h2>Queue:</h2>
            <ul>
            {queue.map((item, index) => (
              <li key={index}>
                {item}
                <button className='cool-button' onClick={() => handleRemoveItem(index)}>Remover</button>
                <button className='cool-button' onClick={() => handleChangeOrder(index, index - 1)}>
                  Subir
                </button>
                <button className='cool-button' onClick={() => handleChangeOrder(index, index + 1)}>
                  Descer
                </button>
              </li>
            ))}
            </ul>
            </div>  
          )}
      </header>
    </div>
  );
}


async function apiCall(valor){
  fetch('http://localhost:3002/musica?valor=' + valor)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    // Handle the API response data here
    console.log(data);
  })
  .catch((error) => {
    // Handle errors
    console.error('There was a problem with the fetch operation:', error);
  });
}

export default App;
