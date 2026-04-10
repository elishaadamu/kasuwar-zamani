'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useAppContext } from "@/context/AppContext"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FiArrowLeft, FiSend, FiMessageCircle } from 'react-icons/fi'
import Loading from "@/components/Loading";

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { userData } = useAppContext()
  const conversationId = params.id 

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!userData) {
      router.push('/signin')
    }
  }, [userData, router])

  // Fetch conversation details
  useEffect(() => {
    if (!userData || !conversationId) return

    const fetchConversation = async () => {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (!error && data) {
        setConversation(data)
      }
      setLoading(false)
    }

    fetchConversation()
  }, [userData, conversationId])

  // Fetch messages
  useEffect(() => {
    if (!conversationId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Show loading or nothing while checking auth
  if (!userData) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Conversation not found</h2>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            ← Back to Messages
          </button>
        </div>
      </div>
    )
  }

  // Send message
  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || sending || !conversationId) return
    
    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userData.id,
        sender_type: userData.role,
        content: trimmedMessage
      })

    if (!error) {
      setNewMessage('')
      
      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: trimmedMessage,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const otherPartyName = userData.role === 'user' ? conversation.vendor_name : conversation.user_name

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back button and other party info */}
            <div className="flex items-center space-x-4 flex-1">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 rounded-full flex items-center justify-center shadow-md">
                  <span className="font-bold text-blue-600 text-lg">
                    {getInitials(otherPartyName)}
                  </span>
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">
                    {otherPartyName}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    {userData.role === 'user' ? '🏪 Vendor' : '👤 Customer'}
                  </p>
                </div>
              </div>
            </div>

            {/* User info */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-white to-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">
                  {userData.firstName?.charAt(0)}
                </span>
              </div>
              <span className="text-white text-sm font-medium">{userData.firstName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FiMessageCircle className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start the conversation with {otherPartyName}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === userData.id
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      {!isOwnMessage && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          showAvatar ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'opacity-0'
                        }`}>
                          {showAvatar && (
                            <span className="text-white font-semibold text-xs">
                              {getInitials(otherPartyName).charAt(0)}
                            </span>
                          )}
                        </div>
                      )}

                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {/* Message bubble */}
                        <div className={`rounded-2xl px-4 py-3 shadow-md ${
                          isOwnMessage 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                        }`}>
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Timestamp */}
                        <p className={`text-xs mt-1 px-1 ${
                          isOwnMessage ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>

                      {/* Own avatar placeholder for alignment */}
                      {isOwnMessage && (
                        <div className="w-8 h-8 opacity-0"></div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${otherPartyName}...`}
                rows="1"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition-all duration-200"
                disabled={sending}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
              <p className="text-xs text-gray-400 mt-1 ml-1">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Powered by Supabase */}
          <div className="mt-3 text-center">
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Powered by</span>
              <svg className="w-16 h-4" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)" />
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2" />
                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E" />
                <defs>
                  <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#249361" />
                    <stop offset="1" stopColor="#3ECF8E" />
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
                    <stop />
                    <stop offset="1" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}