import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [sortedTracks, setSortedTracks] = useState([]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/liked-songs');
        setTracks(response.data);
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };
    fetchLikedSongs();
  }, []);

  const getBpmAndSort = async () => {
    const trackIds = tracks.map(track => track.id).join(',');
    try {
      const response = await axios.get(`http://localhost:3001/track-audio-features?ids=${trackIds}`);
      const tracksWithBpm = tracks.map((track, index) => ({
        ...track,
        bpm: response.data[index].tempo
      }));
      const sorted = tracksWithBpm.sort((a, b) => a.bpm - b.bpm);
      setSortedTracks(sorted);
    } catch (error) {
      console.error('Error fetching audio features:', error);
    }
  };

  return (
    <div>
      <h1>Spotify BPM Sorter</h1>
      <a href="http://localhost:3001/login">Login with Spotify</a>
      <button onClick={getBpmAndSort}>Sort Songs by BPM</button>
      <ul>
        {sortedTracks.map(track => (
          <li key={track.id}>
            {track.name} by {track.artists[0].name} - {track.bpm} BPM
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
