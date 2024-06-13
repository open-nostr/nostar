import React, { useEffect, useState } from 'react';
import './RelayManagementPage.css';
import RelayItemCard from '../elements/RelayItemCard';
import { Server } from '../../server/server';

const RelayManagementPage = () => {

    const [relays, setRelays] = useState<string[]>([]);
    const [newRelay, setNewRelay] = useState<string>('');
    const predefinedRelays = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.current.fyi', 'wss://nostr.wine', 'wss://relayable.org'];

    useEffect(() => {
        const fetchRelays = () => {
          const savedRelays = Server.service.getNostrRelayList();
          setRelays(savedRelays || []);
          console.log('Fetched relays:', savedRelays);
        };
    
        fetchRelays();
      }, []);
    
      useEffect(() => {
        Server.service.setNostrRelayList(relays);
        console.log('Saved relays:', relays);
      }, [relays]);
    
      const handleAddRelay = () => {
        if (newRelay && !relays.includes(newRelay)) {
          setRelays([...relays, newRelay]);
          setNewRelay('');
          console.log('Added relay:', newRelay);
        }
      };
    
      const handleRemoveRelay = (index: number) => {
        const updatedRelays = relays.filter((_, i) => i !== index);
        setRelays(updatedRelays);
        console.log('Removed relay at index:', index);
      };
    
      const handleTogglePredefinedRelay = (relay: string) => {
        if (relays.includes(relay)) {
          setRelays(relays.filter(r => r !== relay));
          console.log('Disconnected relay:', relay);
        } else {
          setRelays([...relays, relay]);
          console.log('Connected relay:', relay);
        }
      };
    
      return (
        <div className="relay-management-page">
          <div className="relay-management-page-header">
            <div className="relay-management-page-title">Relay Management</div>
          </div>
          <div className="relay-list">
            {predefinedRelays.map((relay, index) => (
              <RelayItemCard
                key={index}
                relay={relay}
                onToggle={() => handleTogglePredefinedRelay(relay)}
                isConnected={relays.includes(relay)}
              />
            ))}
            {relays.map((relay, index) => (
              !predefinedRelays.includes(relay) && (
                <RelayItemCard
                  key={index + predefinedRelays.length}
                  relay={relay}
                  onRemove={() => handleRemoveRelay(index)}
                />
              )
            ))}
          </div>
          <div className="relay-item">
            <input 
              type="text" 
              value={newRelay} 
              onChange={(e) => setNewRelay(e.target.value)} 
              placeholder="Add new relay" 
            />
            <button onClick={handleAddRelay}>Add</button>
          </div>
        </div>
      );
    }
    
    export default RelayManagementPage;