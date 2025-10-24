import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, addYears, isSameMonth, isSameYear, addHours } from 'date-fns';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { FaArrowLeft, FaArrowRight, FaTimes, FaSun, FaMoon, FaCalendarDay, FaCalendarWeek } from 'react-icons/fa';
import Navbar from '../Navabar/Navbar';
import axios from 'axios';

// Global Styles for smooth transitions
const GlobalStyle = createGlobalStyle`
  * {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  body {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
`;

// Animation for events
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
    padding-top: 78px;
    padding-right: 50px;
    padding-left: 44px;
  background: ${({ theme }) => (theme === 'dark' ? '#121212' : '#f8f9fa')};
  color: ${({ theme }) => (theme === 'dark' ? '#e0e0e0' : '#333')};
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#2c3e50')};
`;

const DateDisplay = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => (theme === 'dark' ? '#bbbbbb' : '#555')};
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: ${({ theme }) => (theme === 'dark' ? '#333' : '#2196f3')};
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => 
    theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'};
  
  &:hover {
    background: ${({ theme }) => (theme === 'dark' ? '#444' : '#1976d2')};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ViewSwitcher = styled.div`
  display: flex;
  gap: 10px;
  background: ${({ theme }) => (theme === 'dark' ? '#2c2c2c' : '#e9ecef')};
  padding: 5px;
  border-radius: 8px;
`;

const ViewContainer = styled.div`
  width: 100%;
  height: calc(100vh - 200px);
  overflow-y: auto;
  background: ${({ theme }) => (theme === 'dark' ? '#1e1e1e' : '#fff')};
  border-radius: 12px;
  box-shadow: ${({ theme }) => 
    theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'};
`;

const DayView = styled(ViewContainer)`
  display: flex;
  flex-direction: row;
`;

const WeekView = styled(ViewContainer)`
  display: flex;
  flex-direction: row;
`;

const Timeline = styled.div`
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 15px 10px 15px 0;
  border-right: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#eee')};
  position: sticky;
  left: 0;
  background: ${({ theme }) => (theme === 'dark' ? '#1e1e1e' : '#fff')};
  z-index: 1;
`;

const TimelineHour = styled.div`
  height: 60px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme }) => (theme === 'dark' ? '#aaa' : '#666')};
  font-size: 14px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    right: -10px;
    top: 50%;
    width: 10px;
    height: 1px;
    background: ${({ theme }) => (theme === 'dark' ? '#444' : '#eee')};
  }
`;

const DayColumn = styled.div`
  flex: 1;
  min-width: 0;
  border-right: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#eee')};
  padding: 15px 10px;
  position: relative;
  
  &:last-child {
    border-right: none;
  }
`;

const DayHeader = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  position: sticky;
  top: 0;
  background: ${({ theme }) => (theme === 'dark' ? '#1e1e1e' : '#fff')};
  padding: 5px;
  z-index: 1;
  border-bottom: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#eee')};
`;

const HourSlot = styled.div`
  height: 60px;
  border-bottom: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#eee')};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => (theme === 'dark' ? '#aaa' : '#666')};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => (theme === 'dark' ? '#252525' : '#f8f9fa')};
  }
`;

const Event = styled.div`
  background: ${({ theme, type }) => {
    if (theme === 'dark') {
      switch(type) {
        case 'Work': return 'rgba(100, 181, 246, 0.2)';
        case 'Meeting': return 'rgba(255, 213, 79, 0.2)';
        case 'Appointment': return 'rgba(129, 199, 132, 0.2)';
        case 'Personal': return 'rgba(229, 115, 115, 0.2)';
        default: return 'rgba(66, 165, 245, 0.2)';
      }
    } else {
      switch(type) {
        case 'Work': return 'rgba(66, 165, 245, 0.1)';
        case 'Meeting': return 'rgba(255, 213, 79, 0.1)';
        case 'Appointment': return 'rgba(129, 199, 132, 0.1)';
        case 'Personal': return 'rgba(229, 115, 115, 0.1)';
        default: return 'rgba(66, 165, 245, 0.1)';
      }
    }
  }};
  border-left: 4px solid ${({ type }) => {
    switch(type) {
      case 'Work': return '#42a5f5';
      case 'Meeting': return '#ffd54f';
      case 'Appointment': return '#81c784';
      case 'Personal': return '#e57373';
      default: return '#2196f3';
    }
  }};
  padding: 8px;
  margin: 2px 0;
  border-radius: 6px;
  font-size: 14px;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  animation: ${fadeIn} 0.3s ease-out;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    transform: translateX(2px);
    box-shadow: ${({ theme }) => 
      theme === 'dark' ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)'};
  }
`;

const CurrentTimeIndicator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #e53935;
  z-index: 2;
  
  &:before {
    content: '';
    position: absolute;
    left: -5px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e53935;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
`;

const PopupContainer = styled.div`
  background: ${({ theme }) => (theme === 'dark' ? '#2c2c2c' : '#fff')};
  padding: 25px;
  border-radius: 12px;
  box-shadow: ${({ theme }) => 
    theme === 'dark' ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.1)'};
  width: 450px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PopupTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  font-size: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const PopupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => (theme === 'dark' ? '#bbb' : '#555')};
  font-weight: 500;
`;

const FormInput = styled.input`
  padding: 12px;
  border: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#ddd')};
  border-radius: 8px;
  background: ${({ theme }) => (theme === 'dark' ? '#333' : '#fff')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const FormSelect = styled.select`
  padding: 12px;
  border: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#ddd')};
  border-radius: 8px;
  background: ${({ theme }) => (theme === 'dark' ? '#333' : '#fff')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px;
  border: 1px solid ${({ theme }) => (theme === 'dark' ? '#444' : '#ddd')};
  border-radius: 8px;
  background: ${({ theme }) => (theme === 'dark' ? '#333' : '#fff')};
  color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#333')};
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  
  &:hover {
    background: #1976d2;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;


// Popup Component
const Popup = ({ selectedTime, onClose, onSubmit, theme }) => {
  const localHours = selectedTime.getHours().toString().padStart(2, '0');
  const localMinutes = selectedTime.getMinutes().toString().padStart(2, '0');
  const [time, setTime] = useState(`${localHours}:${localMinutes}`);


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  // const [time, setTime] = useState(format(selectedTime, 'HH:mm'));
  useEffect(() => {
    const localTime = new Date(selectedTime);
    console.log("Popup opened with date:", localTime.toString());
    console.log("Date (YYYY-MM-DD):", localTime.toISOString().split('T')[0]);
    console.log("Hours:", localTime.getHours(), "Minutes:", localTime.getMinutes());
  }, [selectedTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create new date in local timezone
    const eventDate = new Date(selectedTime);
    eventDate.setHours(hours, minutes, 0, 0);
    
    onSubmit({
      title,
      description,
      date: eventDate,  // Send as local time
      type,
    });
    
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <PopupContainer theme={theme} onClick={e => e.stopPropagation()}>
        <PopupHeader>
          <PopupTitle theme={theme}>Add New Event</PopupTitle>
          <CloseButton onClick={onClose} theme={theme}>
            <FaTimes />
          </CloseButton>
        </PopupHeader>
        <PopupForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel theme={theme}>Date</FormLabel>
            <FormInput
              type="text"
              value={format(selectedTime, 'EEEE, MMMM d, yyyy')}
              readOnly
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel theme={theme}>Time</FormLabel>
            <FormInput
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel theme={theme}>Event Type</FormLabel>
            <FormSelect
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              theme={theme}
            >
              <option value="">Select type...</option>
              <option value="Work">Work</option>
              <option value="Meeting">Meeting</option>
              <option value="Appointment">Appointment</option>
              <option value="Personal">Personal</option>
            </FormSelect>
          </FormGroup>
          
          <FormGroup>
            <FormLabel theme={theme}>Title</FormLabel>
            <FormInput
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              theme={theme}
              placeholder="Enter event title"
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel theme={theme}>Description</FormLabel>
            <FormTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              theme={theme}
              placeholder="Optional description"
            />
          </FormGroup>
          
          <SubmitButton type="submit">
            Save Event
          </SubmitButton>
        </PopupForm>
      </PopupContainer>
    </Overlay>
  );
};

// Main Component
function Home() {
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [theme, setTheme] = useState('light');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ 
    start: startOfCurrentWeek, 
    end: addDays(startOfCurrentWeek, 6) 
  });

  useEffect(() => {
    fetchReminders();
    loadSettings();
  }, []);

  const fetchReminders = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:8082/getReminders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setReminders(response.data.reminders || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/get-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.reminders && data.reminders.length > 0) {
          const userSettings = data.reminders[0];
          setTheme(userSettings.theme || 'light');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const events = reminders
    .map((reminder) => {
      if (!reminder || !reminder.reminder_time) return null;
      const reminderTime = new Date(reminder.reminder_time);
      if (isNaN(reminderTime.getTime())) return null;

      return {
        id: reminder.id,
        title: reminder.title,
        date: reminderTime,
        type: reminder.type,
        description: reminder.description
      };
    })
    .filter((event) => event !== null);

  const handlePrev = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, -1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, -7));
    else if (view === 'month') setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
    else if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // You might want to save this preference to your backend
  };

  // const handleAddReminder = async (reminder) => {
  //   const token = sessionStorage.getItem("token");
  //   if (!token) {
  //     setError("No token found. Please log in.");
  //     return;
  //   }
  //   try {
  //     const date = new Date(reminder.date);
  //     const gmtPlus2Date = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  //     const formattedDate = gmtPlus2Date.toISOString();

  //     const response = await axios.post("http://localhost:8082/addReminders", {
  //       title: reminder.title,
  //       type: reminder.type,
  //       description: reminder.description,
  //       reminder_time: formattedDate,
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
     
  //     setReminders([...reminders, response.data.reminder]);
  //     await fetchReminders();
  //   } catch (error) {
  //     console.error("Error adding reminder:", error);
  //   }
  // };
 
 
  const handleAddReminder = async (reminder) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }
  
    try {
      // Convert to ISO string without timezone adjustment
     const formattedDate = reminder.date.getFullYear() + "-" +
      (reminder.date.getMonth() + 1).toString().padStart(2, '0') + "-" +
      reminder.date.getDate().toString().padStart(2, '0') + "T" +
      reminder.date.getHours().toString().padStart(2, '0') + ":" +
      reminder.date.getMinutes().toString().padStart(2, '0') + ":00";
  
      const response = await axios.post("http://localhost:8082/addReminders", {
        title: reminder.title,
        type: reminder.type,
        description: reminder.description,
        reminder_time: formattedDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Fetched reminders:", response);
      // setReminders([...reminders, response.data.reminder]);
      await fetchReminders();
      
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };


  const renderDayView = () => {
    // Use simple hour numbers (0-23) instead of Date objects
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const now = new Date();
    const showCurrentTime = isSameDay(now, currentDate);
  
    return (
      <>
        {/* Day header above calendar */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px',
          background: theme === 'dark' ? '#1e1e1e' : '#fff',
          borderRadius: '12px',
          padding: '15px 0',
          boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme === 'dark' ? '#fff' : '#2c3e50'
          }}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
  
        {/* Calendar grid */}
        <DayView theme={theme}>
          <Timeline theme={theme}>
            {hours.map((hour) => (
              <TimelineHour key={hour} theme={theme}>
                {`${hour.toString().padStart(2, '0')}:00`}
              </TimelineHour>
            ))}
          </Timeline>
          <DayColumn theme={theme}>
            {hours.map((hour) => {
              // Create a date with the correct local time
              const hourDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate(),
                hour,
                0,
                0
              );
  
              return (
                <HourSlot
                  key={hour}
                  theme={theme}
                  onClick={() => {
                    // Set the exact time that was clicked
                    const selectedDate = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      currentDate.getDate(),
                      hour,
                      0,
                      0
                    );
                    setSelectedTime(selectedDate);
                    setShowPopup(true);
                  }}
                >
                  {showCurrentTime && now.getHours() === hour && (
                    <CurrentTimeIndicator style={{ 
                      top: `${(now.getMinutes() / 60) * 100}%` 
                    }} />
                  )}
                  {events
                    .filter(
                      (event) =>
                        isSameDay(event.date, currentDate) &&
                        event.date.getHours() === hour
                    )
                    .map((event) => (
                      <Event 
                        key={event.id} 
                        theme={theme} 
                        type={event.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          // You could add a click handler for events here
                        }}
                      >
                        {format(event.date, 'HH:mm')} - {event.title}
                      </Event>
                    ))}
                </HourSlot>
              );
            })}
          </DayColumn>
        </DayView>
      </>
    );
  };

  const renderWeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i); // [0, 1, 2, ..., 23]
    const now = new Date();
    
    return (
      <>
        {/* Day headers row */}
        <div style={{ 
          display: 'flex',
          marginBottom: '10px',
          background: theme === 'dark' ? '#1e1e1e' : '#fff',
          borderRadius: '12px',
          padding: '10px 0',
          boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* Empty cell for timeline */}
          <div style={{ width: '80px' }}></div>
          
          {days.map((day) => {
            const isToday = isSameDay(day, now);
            return (
              <div 
                key={day.toString()}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: isToday ? 'bold' : 'normal',
                  color: isToday ? (theme === 'dark' ? '#64b5f6' : '#1976d2') : 
                                  (theme === 'dark' ? '#e0e0e0' : '#333')
                }}
              >
                <div style={{ fontSize: '16px' }}>{format(day, 'EEE')}</div>
                <div style={{ fontSize: '20px' }}>{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
  
        {/* Calendar grid */}
        <WeekView theme={theme}>
          <Timeline theme={theme}>
            {hours.map((hour) => (
              <TimelineHour key={hour} theme={theme}>
                {`${hour.toString().padStart(2, '0')}:00`}
              </TimelineHour>
            ))}
          </Timeline>
          {days.map((day) => {
            const isToday = isSameDay(day, now);
            
            return (
              <DayColumn key={day.toString()} theme={theme}>
                {hours.map((hour) => {
                  // Create date with correct local time
                  const slotDate = new Date(
                    day.getFullYear(),
                    day.getMonth(),
                    day.getDate(),
                    hour,
                    0,
                    0
                  );
  
                  return (
                    <HourSlot
                      key={hour}
                      theme={theme}
                      onClick={() => {
                        setSelectedTime(slotDate);
                        setShowPopup(true);
                      }}
                    >
                      {/* Current time indicator - only show if it's today and this hour */}
                      {isToday && now.getHours() === hour && (
                        <CurrentTimeIndicator style={{ 
                          top: `${(now.getMinutes() / 60) * 100}%` 
                        }} />
                      )}
                      
                      {/* Events for this time slot */}
                      {events
                        .filter(event => 
                          isSameDay(event.date, day) && 
                          event.date.getHours() === hour
                        )
                        .map(event => (
                          <Event 
                            key={event.id} 
                            theme={theme} 
                            type={event.type}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {format(event.date, 'HH:mm')} - {event.title}
                          </Event>
                        ))}
                    </HourSlot>
                  );
                })}
              </DayColumn>
            );
          })}
        </WeekView>
      </>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <GlobalStyle />
      <Navbar />
      <CalendarContainer theme={theme}>
        <Navigation>
          <div>
            <Title theme={theme}>Calendar</Title>
            <DateDisplay theme={theme}>
              {view === 'day' && format(currentDate, 'MMMM yyyy')}
              {view === 'week' && `${format(startOfCurrentWeek, 'MMM d')} - ${format(addDays(startOfCurrentWeek, 6), 'MMM d, yyyy')}`}
            </DateDisplay>
          </div>
          
          <ViewSwitcher theme={theme}>
            <Button 
              theme={theme} 
              onClick={() => {
                setCurrentDate(new Date());
                setView('day');
              }}
              style={{
                background: view === 'day' ? (theme === 'dark' ? '#444' : '#1976d2') : undefined
              }}
            >
              <FaCalendarDay /> Day
            </Button>
            <Button 
              theme={theme} 
              onClick={() => setView('week')}
              style={{
                background: view === 'week' ? (theme === 'dark' ? '#444' : '#1976d2') : undefined
              }}
            >
              <FaCalendarWeek /> Week
            </Button>
          </ViewSwitcher>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button theme={theme} onClick={handlePrev}>
              <FaArrowLeft />
            </Button>
            <Button theme={theme} onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button theme={theme} onClick={handleNext}>
              <FaArrowRight />
            </Button>
            {/* <Button theme={theme} onClick={toggleTheme}>
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </Button> */}
          </div>
        </Navigation>

        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}

        {showPopup && (
          <Popup
            selectedTime={selectedTime}
            onClose={() => setShowPopup(false)}
            onSubmit={handleAddReminder}
            theme={theme}
          />
        )}
      </CalendarContainer>
    </>
  );
}

// Helper function
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default Home;