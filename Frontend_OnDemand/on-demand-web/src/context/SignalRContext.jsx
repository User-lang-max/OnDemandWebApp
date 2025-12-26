import { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const SignalRContext = createContext();

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
   
    const token = localStorage.getItem('token');
    if (!token) return;


    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5234/hubs/notifications", {
     
        accessTokenFactory: () => token 
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

 
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => console.log(' SignalR Connecté !'))
        .catch(err => console.error(' Erreur Connexion SignalR:', err));
    }
  }, [connection]);

  return (
    <SignalRContext.Provider value={{ connection }}>
      {children}
    </SignalRContext.Provider>
  );
};