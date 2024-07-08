import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/songs');
        setSongs(response.data);
      } catch (error) {
        console.error('Error fetching songs', error);
      }
    };
    fetchSongs();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <a href="http://localhost:3000/login">Log in to Spotify</a>
        <h1>Your Liked Songs</h1>
        <ul>
          {songs.map(song => (
            <li key={song.track.id}>
              {song.track.name} by {song.track.artists[0].name} - {song.track.tempo} BPM
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
