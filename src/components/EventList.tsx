import { Calendar, Clock, MapPin, Video, X } from 'lucide-react';
import { useState } from 'react';
import { CalendarEvent } from '../types';

interface EventListProps {
  events: CalendarEvent[];
  filter: string;
}

export function EventList({ events, filter = 'all' }: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.start.dateTime || a.start.date || '');
    const dateB = new Date(b.start.dateTime || b.start.date || '');

    if (filter === 'upcoming' || filter === 'birthdays') {
      return dateA.getTime() - dateB.getTime();
    }
    
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (date: Date, isBirthday: boolean = false) => {
    if (isBirthday) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFullDate = (date: Date, isBirthday: boolean = false) => {
    if (isBirthday) {
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
    }
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (events.length === 0) {
    return (
      <div className='w-full max-w-3xl glassmorphic rounded-lg shadow-xl p-8 text-center'>
        <Calendar className='w-12 h-12 text-gray-400 mx-auto mb-4' />
        <p className='text-lg text-gray-300'>No events found</p>
      </div>
    );
  }

  return (
    <div className='w-full flex gap-6'>
      <div className='w-3/5 overflow-x-auto glassmorphic rounded-lg shadow-xl'>
        <table className='w-full min-w-full divide-y divide-white/10'>
          <thead>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
              >
                Event Name
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
              >
                Date
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-white/10'>
            {sortedEvents.map((event) => {
              const eventDate = new Date(
                event.start.dateTime || event.start.date || ''
              );
              const isBirthday = 'birthdayProperties' in event;
              const formattedDate = formatDate(eventDate, isBirthday);

              let timeDisplay = 'All day';
              if (event.start.dateTime) {
                const startTime = new Date(
                  event.start.dateTime
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                timeDisplay = startTime;
              }

              return (
                <tr
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${
                    selectedEvent?.id === event.id ? 'bg-white/10' : ''
                  }`}
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-white'>
                    {event.summary}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                    {formattedDate}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                    {timeDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <div className='w-2/5 glassmorphic rounded-lg shadow-xl p-6 h-fit sticky top-8'>
          <div className='flex justify-between items-start mb-4'>
            <h3 className='text-lg font-semibold text-white'>
              {selectedEvent.summary}
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='space-y-4'>
            <div className='flex items-start gap-2'>
              <Clock className='w-5 h-5 text-gray-400 mt-0.5' />
              <div className='text-gray-300'>
                <div>
                  {formatFullDate(
                    new Date(
                      selectedEvent.start.dateTime ||
                        selectedEvent.start.date ||
                        ''
                    ),
                    'birthdayProperties' in selectedEvent
                  )}
                </div>
                {selectedEvent.start.dateTime && (
                  <div className='text-sm'>
                    {new Date(selectedEvent.start.dateTime).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}{' '}
                    -{' '}
                    {new Date(selectedEvent.end.dateTime!).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedEvent.location && (
              <div className='flex items-start gap-2'>
                <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                <p className='text-gray-300'>{selectedEvent.location}</p>
              </div>
            )}

            {selectedEvent.description && (
              <div className='mt-4 pt-4 border-t border-white/10'>
                <h4 className='text-sm font-medium text-gray-400 mb-2'>
                  Description
                </h4>
                <p className='text-gray-300 whitespace-pre-wrap text-sm'>
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {'conferenceData' in selectedEvent &&
              selectedEvent.conferenceData?.conferenceId && (
                <div className='mt-4 pt-4 border-t border-white/10 flex items-center gap-2'>
                  <Video className='w-5 h-5 text-gray-400' />
                  <a
                    href={`https://meet.google.com/${selectedEvent.conferenceData.conferenceId}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:text-blue-300 transition-colors'
                  >
                    Google Meet link
                  </a>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
