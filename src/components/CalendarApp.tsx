import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, KeyRound, LogOut } from 'lucide-react';
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
    const storedToken = localStorage.getItem('calendarAccessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (storedToken && tokenExpiry) {
      if (new Date().getTime() < parseInt(tokenExpiry)) {
        setAccessToken(storedToken);
        fetchCalendarEvents(storedToken);
      } else {
        localStorage.removeItem('calendarAccessToken');
        localStorage.removeItem('tokenExpiry');
      }
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Token Response:', tokenResponse);
      const token = tokenResponse.access_token;

      // token expires in 1 hour
      const expiryTime = new Date().getTime() + 3600000;
      localStorage.setItem('calendarAccessToken', token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      setAccessToken(token);
      fetchCalendarEvents(token);
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const logout = () => {
    localStorage.removeItem('calendarAccessToken');
    localStorage.removeItem('tokenExpiry');

    setAccessToken(null);
    setEvents([]);
  };

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
          localStorage.removeItem('calendarAccessToken');
          localStorage.removeItem('tokenExpiry');
          setAccessToken(null);
          return;
        }
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();

      // filter out invalid events
      const validEvents = data.items.filter((event: CalendarEvent) => {
        return (
          event.summary && 
          (event.start?.date || event.start?.dateTime) &&
          (event.end?.date || event.end?.dateTime)
        );
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
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.start.dateTime || event.start.date || '');
        return eventDate >= now;
      });
    } else if (filter === 'past') {
      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.start.dateTime || event.start.date || '');
        return eventDate < now;
      });
    } else if (filter === 'birthdays') {
      filteredEvents = filteredEvents.filter((event) => {
        return 'birthdayProperties' in event;
      });
    }

    if (selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.start.dateTime || event.start.date || '');
        return eventDate >= selectedDateStart && eventDate <= selectedDateEnd;
      });
    }

    return filteredEvents;
  };

  return (
    <div className='min-h-screen bg-black relative'>
      <div className='absolute inset-0 grid-background'></div>
      <div className='container mx-auto py-8 px-12 relative'>
        {!accessToken ? (
          <div className='flex flex-col items-center justify-center min-h-[80vh]'>
            <Calendar className='w-16 h-16 text-blue-400 mb-4' />
            <h1 className='text-3xl font-bold text-white mb-8'>
              Calendar Events Viewer 
            </h1>
            <button
              onClick={() => login()}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3'
            >
              <KeyRound className='w-5 h-5' />
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className='flex flex-col'>
            <div className='flex justify-between items-center mb-8'>
              <h1 className='text-3xl font-bold text-white'>
                Your Calendar Events
              </h1>
              <button
                onClick={logout}
                className='px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center gap-2'
              >
                <LogOut className='w-5 h-5' />
                Logout
              </button>
            </div>

            <div className='flex items-center gap-4 mb-6'>
              <div className='glassmorphic rounded-lg p-1 flex gap-1'>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors text-white ${
                    filter === 'all' ? 'bg-blue-900/80' : 'hover:bg-white/5'
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
                    filter === 'past' ? 'bg-red-900/80' : 'hover:bg-white/5'
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
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='px-4 py-2 glassmorphic text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50'
              />
            </div>

            <EventList events={filterEvents(events)} filter={filter} />
          </div>
        )}
      </div>
    </div>
  );
}
