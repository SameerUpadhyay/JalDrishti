import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Camera, Paperclip, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = `
You are JalDrishti AI, a helpful, empathetic water assistant for citizens of Bengaluru.
You can speak English and Kannada. 
Your job is to answer questions about water supply, take complaints about pipe bursts or leaks, and explain water quality.
If the user uploads an image of water, pipes, or leaks, analyze the visual evidence and incorporate it into your response.
Be concise, polite, and use local terms like "Namma Bengaluru" or "Namaskara" occasionally.

IMPORTANT INSTRUCTION FOR HANDLING MENU OPTIONS:
If the user types "1" or says they want to "Report a Complaint", you must immediately ask them for details about the issue (e.g., what happened, location, and severity). Do not provide general information; strictly guide them through reporting a complaint.

IMPORTANT INSTRUCTION FOR COMPLAINTS:
If a user reports an issue (like a pipe burst, leak, low pressure, or bad water quality), you must generate a tracking ID (e.g., CMP-2026-XXXX) and assure them the BWSSB team is alerted.
Additionally, you MUST append a JSON block at the very end of your response containing the details of the anomaly. This JSON will be parsed by the system to auto-file the complaint.
The JSON must be wrapped in \`\`\`json and \`\`\` and match this exact structure:
\`\`\`json
{
  "isComplaint": true,
  "trackingId": "CMP-2026-XXXX",
  "type": "Major Pipe Burst | Suspected Water Theft | Slow Leak Detected | Water Quality Issue",
  "location": "Extract the location from the user message, add 'User Reported' (e.g., 'Indiranagar, User Reported')",
  "severity": "Critical | High | Medium | Low",
  "severityColor": "234, 67, 53 | 242, 153, 0 | 161, 66, 244 | 52, 168, 83",
  "icon": ""
}
\`\`\`
Only append this JSON block if the user is explicitly reporting an actionable issue.

IMPORTANT INSTRUCTION FOR TRACKING COMPLAINTS:
If the user wants to track a complaint (e.g. they type '2', 'Track a Complaint', or provide a tracking ID), you must append a JSON block at the very end to trigger the tracker UI:
\`\`\`json
{
  "isTrackComplaint": true,
  "trackingId": "Extract tracking ID if they provided one, otherwise empty string"
}
\`\`\`
Say something like "Sure, I am taking you to the Complaint Tracker..." and include the JSON block.
`;

const initialMessages = [
  {
    id: 1,
    type: 'bot',
    text: 'Namaskara! I am JalDrishti AI, your personal water assistant for Namma Bengaluru.\n\nHow can I help you today?\n1. Report a Complaint\n2. Track a Complaint\n\nYou can type your choice or simply ask any water-related question.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

const CitizenChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  // Maintain stateless conversation history for the API
  const [chatHistory, setChatHistory] = useState([]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const { t } = useLanguage();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, attachedFile]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          file: file,
          base64: reader.result.split(',')[1],
          mimeType: file.type,
          previewUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !attachedFile) || isLoading) return;

    const userText = inputValue.trim();
    const fileToSend = attachedFile;
    
    setInputValue('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // 1. Update UI with user message
    const newUserMsg = {
      id: Date.now(),
      type: 'user',
      text: userText,
      image: fileToSend ? fileToSend.previewUrl : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // 2. Format the new interaction for the API
      const newPartContent = [];
      if (fileToSend) {
        newPartContent.push({
          inlineData: {
            data: fileToSend.base64,
            mimeType: fileToSend.mimeType
          }
        });
      }
      if (userText) {
        newPartContent.push({ text: userText });
      } else if (fileToSend) {
        newPartContent.push({ text: "Please analyze this image." });
      }

      const newUserInteraction = {
        role: "user",
        parts: newPartContent
      };

      const updatedHistory = [...chatHistory, newUserInteraction];

      // 3. Make REST API Call
      const requestPayload = {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: updatedHistory,
        generationConfig: {
          temperature: 0.7
        }
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      let responseText = '';
      if (data.candidates && data.candidates[0].content.parts.length > 0) {
        responseText = data.candidates[0].content.parts[0].text;
      }

      if (!responseText) {
         throw new Error("Received empty response from API");
      }

      // 4. Update the internal chat history so the bot remembers context
      const newModelInteraction = {
        role: "model",
        parts: [{ text: responseText }]
      };
      setChatHistory([...updatedHistory, newModelInteraction]);
      
      // 5. Check for JSON block to auto-file complaint
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const complaintData = JSON.parse(jsonMatch[1]);
          if (complaintData.isComplaint) {
            // Write to MySQL Express API
            const res = await fetch('http://localhost:3002/api/anomalies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: complaintData.type || 'Citizen Report',
                location: complaintData.location || 'Unknown Location',
                severity: complaintData.severity || 'Medium',
                severityColor: complaintData.severityColor || '161, 66, 244',
                icon: complaintData.icon || '',
                trackingId: complaintData.trackingId || `CMP-2026-${Math.random().toString(36).substring(2,6).toUpperCase()}`
              })
            });

            if (!res.ok) {
              throw new Error('Failed to auto-file complaint');
            }

            console.log("Auto-filed complaint to MySQL:", complaintData);
            
            // Remove the JSON block from the chat text shown to the user
            responseText = responseText.replace(jsonMatch[0], '').trim();
          } else if (complaintData.isTrackComplaint) {
            responseText = responseText.replace(jsonMatch[0], '').trim();
            // Wait slightly so the user can see the message before navigation
            setTimeout(() => {
              if (complaintData.trackingId) {
                navigate('/citizen/complaints', { state: { trackingId: complaintData.trackingId } });
              } else {
                navigate('/citizen/complaints');
              }
            }, 1500);
          }
        } catch (parseError) {
          console.error("Failed to parse complaint JSON:", parseError);
        }
      }
      
      // 6. Display bot response in UI
      const newBotMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newBotMsg]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: `Sorry, I am having trouble connecting to the network right now. Please try again later. (Error: ${error.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">{t('chatbot.title')}</h1>
        <p className="page-subtitle">{t('chatbot.subtitle')}</p>
      </div>

      <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div className="chat-header">
          <Bot size={24} />
          <div>
            <div>JalDrishti Assistant</div>
            <div style={{ fontSize: '12px', fontWeight: 400, opacity: 0.9 }}>Powered by Gemini</div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div style={{ marginTop: '4px' }}>
                {msg.type === 'bot' ? (
                  <div style={{ background: '#E8F0FE', padding: '6px', borderRadius: '50%', color: 'var(--google-blue)' }}>
                    <Bot size={16} />
                  </div>
                ) : (
                  <div style={{ background: '#F1F3F4', padding: '6px', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                    <User size={16} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div className="message-bubble" style={{ whiteSpace: 'pre-wrap', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {msg.image && (
                    <img src={msg.image} alt="User Upload" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'contain' }} />
                  )}
                  {msg.text && <span>{msg.text}</span>}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="message bot">
              <div style={{ marginTop: '4px' }}>
                <div style={{ background: '#E8F0FE', padding: '6px', borderRadius: '50%', color: 'var(--google-blue)' }}>
                  <Bot size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderTop: '1px solid var(--border-default)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          
          {/* Image Preview Overlay */}
          {attachedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '8px', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <img src={attachedFile.previewUrl} alt="Preview" style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)' }}>{attachedFile.file.name}</div>
              <button onClick={removeAttachment} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="chat-input-area" style={{ border: 'none', padding: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, boxShadow: 'none' }}>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip size={20} />
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
              onClick={() => fileInputRef.current.click()}
            >
              <Camera size={20} />
            </button>
            <input 
              type="text" 
              placeholder={t('chatbot.placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{ 
                flex: 1, 
                border: '1px solid var(--border-light)', 
                borderRadius: '100px', 
                padding: '10px 16px', 
                margin: '0 8px',
                color: 'var(--text-primary)',
                background: 'var(--bg-surface)'
              }}
            />
            <button 
              className="btn-send" 
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && !attachedFile)}
              style={{ opacity: (isLoading || (!inputValue.trim() && !attachedFile)) ? 0.5 : 1 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default CitizenChatbot;
