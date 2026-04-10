'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from "@/context/AppContext"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FiSearch, FiMessageCircle, FiArrowLeft, FiUser } from 'react-icons/fi'
import Loading from '@/components/Loading'

export default function ChatListPage() {
  const router = useRouter()
  const { userData } = useAppContext()
  const [conversations, setConversations] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!userData) {
      router.push('/signin')
    }
  }, [userData, router])

  // Fetch conversations
  useEffect(() => {
    if (!userData) return

    const fetchConversations = async () => {
      setLoading(true)
      
      // Determine column based on user role
      const column = userData.role === 'user' ? 'user_id' : 'vendor_id'
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq(column, userData.id)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (!error && data) {
        setConversations(data)
        setFilteredConversations(data)
      }
      setLoading(false)
    }

    fetchConversations()

    // Subscribe to new conversations
    const channel = supabase
      .channel(`user-conversations-${userData.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `${userData.role === 'user' ? 'user_id' : 'vendor_id'}=eq.${userData.id}`
        },
        () => {
          fetchConversations() // Refresh list
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userData])

  // Filter conversations based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(conversation => {
        const otherPartyName = getOtherPartyName(conversation).toLowerCase()
        const lastMessage = (conversation.last_message || '').toLowerCase()
        const query = searchQuery.toLowerCase()
        return otherPartyName.includes(query) || lastMessage.includes(query)
      })
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  // Show loading or nothing while checking auth
  if (!userData) {
    return <Loading />
  }

  const getOtherPartyName = (conversation) => {
    if (userData.role === 'user') {
      return conversation.vendor_name
    } else {
      return conversation.user_name
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiMessageCircle className="w-7 h-7" />
                  Messages
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center shadow-md`}>
                <span className="text-blue-600 font-bold text-sm">
                  {userData.firstName?.charAt(0) || <FiUser />}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-medium text-sm">
                  {userData.role === 'vendor' ? userData.businessName : userData.firstName}
                </p>
                <p className="text-blue-100 text-xs capitalize">{userData.role}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:shadow-lg transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Loading />
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiMessageCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {searchQuery ? 'No results found' : 'No messages yet'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search to find what you\'re looking for' 
                : 'Start a conversation by visiting a vendor\'s store and clicking the message button'}
            </p>
            {!searchQuery && (
              <Link
                href="/all-vendors"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                <FiUser className="w-5 h-5" />
                Browse Vendors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => {
              const otherPartyName = getOtherPartyName(conversation)
              const hasUnread = conversation.unread_count > 0
              
              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/inbox-support/${conversation.id}`}
                  className="block group"
                >
                  <div className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border-2 ${
                    hasUnread ? 'border-blue-200 bg-blue-50/30' : 'border-transparent hover:border-blue-100'
                  }`}>
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                          hasUnread 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        } group-hover:scale-110 transition-transform duration-200`}>
                          <span className="text-white font-bold text-lg">
                            {getInitials(otherPartyName)}
                          </span>
                        </div>
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{conversation.unread_count}</span>
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-semibold truncate ${
                            hasUnread ? 'text-gray-900' : 'text-gray-800'
                          } text-lg`}>
                            {otherPartyName}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                        
                        <p className={`text-sm truncate mb-2 ${
                          hasUnread ? 'text-gray-700 font-medium' : 'text-gray-600'
                        }`}>
                          {conversation.last_message || 'No messages yet'}
                        </p>

                        {/* Role badge */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                            userData.role === 'user' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                              : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                          }`}>
                            {userData.role === 'user' ? '🏪 Vendor' : '👤 Customer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Powered by Supabase Footer */}
      <div className="py-6 text-center">
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
  )
}