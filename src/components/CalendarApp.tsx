import { useGoogleLogin } from '@react-oauth/google';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CalendarEvent } from '../types';
import { EventList } from './EventList';

type EventFilter = 'all' | 'upcoming' | 'past' | 'birthdays';

export function CalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    // Check for stored token on component mount
    const storedToken = localStorage.getItem('calendarAccessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (storedToken && tokenExpiry) {
      // Check if token is still valid (not expired)
      if (new Date().getTime() < parseInt(tokenExpiry)) {
        setAccessToken(storedToken);
        fetchCalendarEvents(storedToken);
      } else {
        // Clear expired token
        localStorage.removeItem('calendarAccessToken');
        localStorage.removeItem('tokenExpiry');
      }
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Token Response:', tokenResponse);
      const token = tokenResponse.access_token;
      
      // Store token and its expiry time (1 hour from now)
      const expiryTime = new Date().getTime() + 3600000; // Current time + 1 hour
      localStorage.setItem('calendarAccessToken', token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      setAccessToken(token);
      fetchCalendarEvents(token);
    },
    onError: error => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const fetchCalendarEvents = async (token: string) => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('calendarAccessToken');
          localStorage.removeItem('tokenExpiry');
          setAccessToken(null);
          return;
        }
        throw new Error('Failed to fetch calendar events');
      }
      
      const data = await response.json();
      
      // Filter out invalid events
      const validEvents = data.items.filter((event: CalendarEvent) => {
        return event.summary && // Has a title
               (event.start?.date || event.start?.dateTime) && // Has a start date/time
               (event.end?.date || event.end?.dateTime); // Has an end date/time
      });
      
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  const filterEvents = (events: CalendarEvent[]) => {
    const now = new Date();
    let filteredEvents = [...events];

    if (filter === 'upcoming') {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date || '');
        return eventDate >= now;
      });
    } else if (filter === 'past') {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date || '');
        return eventDate < now;
      });
    } else if (filter === 'birthdays') {
      filteredEvents = filteredEvents.filter(event => {
        return 'birthdayProperties' in event;
      });
    }

    if (selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date || '');
        return eventDate >= selectedDateStart && eventDate <= selectedDateEnd;
      });
    }

    return filteredEvents;
  };

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 grid-background"></div>
      <div className="container mx-auto py-8 px-12 relative">
        {!accessToken ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Calendar className="w-16 h-16 text-blue-400 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-8">
              Calendar Events Viewer App
            </h1>
            <button
              onClick={() => login()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-8">
              Your Calendar Events
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="glassmorphic rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    filter === 'all'
                      ? 'bg-blue-900/80'
                      : 'hover:bg-white/5'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    filter === 'upcoming'
                      ? 'bg-green-900/80'
                      : 'hover:bg-white/5'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    filter === 'past'
                      ? 'bg-red-900/80'
                      : 'hover:bg-white/5'
                  }`}
                >
                  Past
                </button>
                <button
                  onClick={() => setFilter('birthdays')}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    filter === 'birthdays'
                      ? 'bg-purple-900/80'
                      : 'hover:bg-white/5'
                  }`}
                >
                  Birthdays
                </button>
              </div>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 glassmorphic text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <EventList events={filterEvents(events)} filter={filter} />
          </div>
        )}
      </div>
    </div>
  );
}