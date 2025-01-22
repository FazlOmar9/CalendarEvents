export interface CalendarEvent {
    id: string;
    summary: string;
    start: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    end: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    description?: string;
    location?: string;
    birthdayProperties?: {
      text: string;
    };
    conferenceData?: {
      conferenceId: string;
    };
  }