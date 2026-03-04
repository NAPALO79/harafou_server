import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// NOTE : Remplacez l'URL ci-dessous par celle que Render vous donnera
const socket = io("https://votre-serveur-harafou.onrender.com"); 

export default function App() {
  const [view, setView] = useState('lock'); 
  const [myId, setMyId] = useState("DIRECTEUR-ALPHA"); // Votre ID
  const [targetId, setTargetId] = useState(""); // ID de l'agent à contacter
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [callStatus, setCallStatus] = useState(null);

  // ÉCOUTE DU RÉSEAU
  useEffect(() => {
    socket.emit('register', myId);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, { ...msg, bot: false }]);
    });

    socket.on('incoming_call', ({ from, type }) => {
      setCallStatus({ from, type });
      setView(type); // Bascule en vue appel
    });

    return () => socket.off();
  }, [myId]);

  const handleSend = () => {
    if (!input.trim() || !targetId) return;
    // Envoi au serveur
    socket.emit('private_message', { to: targetId, text: input, from: myId });
    // Affichage local
    setMessages([...messages, { text: input, from: 'Moi', bot: false }]);
    setInput("");
  };

  const startCall = (type) => {
    if (!targetId) return alert("Entrez l'ID de l'agent");
    socket.emit('call_request', { to: targetId, from: myId, type });
    setView(type);
  };

  // --- INTERFACE DE VERROUILLAGE ---
  if (view === 'lock') return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#708271', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '80px' }}>👁️</h1>
        <input type="password" onKeyPress={(e) => e.key === 'Enter' && setView('chat')} style={{ padding: '15px', borderRadius: '15px', border: 'none', textAlign: 'center' }} placeholder="Code Direction" />
      </div>
    </div>
  );

  // --- INTERFACE DE CHAT RÉSEAU ---
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#888', fontFamily: 'sans-serif' }}>
      <div style={{ width: '400px', height: '90vh', backgroundColor: '#f7f7f2', borderRadius: '45px', border: '8px solid #1a1a1a', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        <header style={{ padding: '15px', backgroundColor: '#708271', color: 'white' }}>
          <div style={{ fontSize: '10px' }}>MON ID : <b>{myId}</b></div>
          <input 
            value={targetId} 
            onChange={(e) => setTargetId(e.target.value)} 
            placeholder="ID DE L'AGENT..." 
            style={{ width: '100%', marginTop: '5px', padding: '5px', borderRadius: '5px', border: 'none', fontSize: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
            <span onClick={() => startCall('call')} style={{ cursor: 'pointer' }}>📞</span>
            <span onClick={() => startCall('video')} style={{ cursor: 'pointer' }}>📹</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#e5e5e0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.from === 'Moi' ? 'flex-end' : 'flex-start', backgroundColor: m.from === 'Moi' ? '#dcf8c6' : 'white', padding: '10px', borderRadius: '15px', fontSize: '14px' }}>
              <small style={{ display: 'block', fontSize: '8px', color: '#708271' }}>{m.from}</small>
              {m.text}
            </div>
          ))}
        </main>

        <footer style={{ padding: '15px', backgroundColor: 'white', display: 'flex', gap: '10px' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Envoyer un ordre..." style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }} />
          <button onClick={handleSend} style={{ backgroundColor: '#708271', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px' }}>↑</button>
        </footer>
      </div>
    </div>
  );
}
