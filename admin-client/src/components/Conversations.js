import React, { useState, useEffect, useRef } from 'react';

// Componente para exibir uma mensagem individual
const MessageBubble = ({ message, isFromBot }) => {
  const messageDate = new Date(message.timestamp).toLocaleString();
  
  return (
    <div className={`flex ${isFromBot ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`max-w-3/4 p-3 rounded-lg ${
        isFromBot 
          ? 'bg-blue-100 text-blue-800 rounded-bl-none' 
          : 'bg-green-100 text-green-800 rounded-br-none'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-gray-500 mt-1">{messageDate}</p>
      </div>
    </div>
  );
};

// Componente para exibir a conversa com um cliente
function ConversationView({ conversation, onClose, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Rola para a mensagem mais recente quando a conversa muda
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    onSendMessage(conversation.phone, newMessage);
    setNewMessage('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!conversation) return null;
  
  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">{conversation.phone}</h3>
          <p className="text-sm text-gray-500">
            Conversa iniciada em {new Date(conversation.createdAt).toLocaleString()}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Modificação: Adiciona altura máxima fixa e rolagem */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 max-h-[calc(100vh-300px)] min-h-[400px]">
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((msg, index) => (
            <MessageBubble 
              key={index} 
              message={msg} 
              isFromBot={msg.isFromBot} 
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhuma mensagem nesta conversa</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de item de conversa para a lista
function ConversationItem({ conversation, onSelect }) {
  const lastMessage = conversation.messages && conversation.messages.length > 0
    ? conversation.messages[conversation.messages.length - 1]
    : null;
    
  const lastMessagePreview = lastMessage
    ? lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content
    : 'Nenhuma mensagem';
    
  const lastMessageTime = lastMessage
    ? new Date(lastMessage.timestamp).toLocaleString()
    : '';
  
  return (
    <div 
      className="bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(conversation)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{conversation.phone}</h3>
        <span className="text-xs text-gray-500">{lastMessageTime}</span>
      </div>
      <p className="text-gray-600 text-sm truncate">{lastMessagePreview}</p>
    </div>
  );
}

// Componente principal da página de conversas
function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Carrega a lista de conversas
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      // Em um app real, este seria um fetch real para sua API
      const response = await fetch('http://localhost:3030/api/conversations');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar conversas');
      }
      
      const data = await response.json();
      setConversations(data.conversations);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar conversas. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carrega uma conversa específica
  const fetchConversation = async (phone) => {
    try {
      // Em um app real, este seria um fetch real para sua API
      const response = await fetch(`/api/conversations/${phone}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar conversa');
      }
      
      const data = await response.json();
      
      // Atualiza a conversa selecionada e a lista de conversas
      setSelectedConversation(data);
      setConversations(prev => 
        prev.map(c => c.phone === phone ? data : c)
      );
    } catch (err) {
      console.error(err);
    }
  };
  
  // Envia uma nova mensagem
  const handleSendMessage = async (phone, message) => {
    try {
      // Em um app real, este seria um fetch real para sua API
      const response = await fetch('/api/bot/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, message })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      // Simulação - em uma app real, você atualizaria após resposta da API
      // Atualiza a conversa localmente para mostrar a mensagem imediatamente
      const newMessage = {
        content: message,
        timestamp: new Date().toISOString(),
        isFromBot: true
      };
      
      setSelectedConversation(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date().toISOString()
        };
      });
      
      // Recarrega a conversa após um curto intervalo para obter a resposta do bot
      setTimeout(() => {
        fetchConversation(phone);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };
  
  // Carrega as conversas na inicialização
  useEffect(() => {
    fetchConversations();
    
    // Polling para atualizar conversas a cada 15 segundos
    const intervalId = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchConversation(selectedConversation.phone);
      }
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filtra as conversas pelo termo de busca
  const filteredConversations = conversations.filter(conversation => 
    conversation.phone.includes(searchTerm)
  );
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Conversas de WhatsApp</h2>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por número de telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="font-semibold text-lg mb-4">Conversas Recentes</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando conversas...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="space-y-4 max-h-screen overflow-y-auto pr-2">
              {filteredConversations.map(conversation => (
                <ConversationItem 
                  key={conversation.phone} 
                  conversation={conversation} 
                  onSelect={setSelectedConversation} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2 h-full">
          {selectedConversation ? (
            <ConversationView 
              conversation={selectedConversation} 
              onClose={() => setSelectedConversation(null)} 
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center h-64 flex items-center justify-center">
              <p className="text-gray-500">Selecione uma conversa para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Conversations;