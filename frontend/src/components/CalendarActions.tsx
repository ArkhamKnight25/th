import React from 'react';

interface CalendarActionsProps {
  appointment: {
    id: number;
    test_type: string;
    appointment_time: string;
    address: string;
    doctor_name?: string;
    patient_name?: string;
    user_type?: 'doctor' | 'patient';
  };
}

const CalendarActions: React.FC<CalendarActionsProps> = ({ appointment }) => {
  const formatDateForCalendar = (dateString: string) => {
    return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const createCalendarUrls = () => {
    const startDate = new Date(appointment.appointment_time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
    
    const title = `${appointment.test_type} Appointment`;
    const description = appointment.user_type === 'doctor' 
      ? `Patient: ${appointment.patient_name || 'Patient'}\nTest Type: ${appointment.test_type}\nAddress: ${appointment.address}`
      : `Doctor: ${appointment.doctor_name || 'Healthcare Provider'}\nTest Type: ${appointment.test_type}\nAddress: ${appointment.address}`;
    
    const startFormatted = formatDateForCalendar(startDate.toISOString());
    const endFormatted = formatDateForCalendar(endDate.toISOString());
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(appointment.address)}`;
    
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(appointment.address)}`;
    
    return { googleUrl, outlookUrl };
  };

  const downloadICSFile = () => {
    const startDate = new Date(appointment.appointment_time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Telehealth Companion//EN
BEGIN:VEVENT
UID:appointment-${appointment.id}@telehealthcompanion.com
DTSTAMP:${formatDateForCalendar(new Date().toISOString())}
DTSTART:${formatDateForCalendar(startDate.toISOString())}
DTEND:${formatDateForCalendar(endDate.toISOString())}
SUMMARY:${appointment.test_type} Appointment
DESCRIPTION:${appointment.user_type === 'doctor' 
      ? `Patient: ${appointment.patient_name || 'Patient'}` 
      : `Doctor: ${appointment.doctor_name || 'Healthcare Provider'}`}\\nTest Type: ${appointment.test_type}
LOCATION:${appointment.address}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Appointment reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointment.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { googleUrl, outlookUrl } = createCalendarUrls();

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        📅 Add to Calendar
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => window.open(googleUrl, '_blank')}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <span className="mr-1">📅</span>
          Google Calendar
        </button>
        
        <button
          onClick={() => window.open(outlookUrl, '_blank')}
          className="flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
        >
          <span className="mr-1">📅</span>
          Outlook
        </button>
        
        <button
          onClick={downloadICSFile}
          className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          <span className="mr-1">⬇️</span>
          Download .ics
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Choose your preferred calendar app to add this appointment
      </p>
    </div>
  );
};

export default CalendarActions;