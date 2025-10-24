import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { 
  FaTimes, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaUser, 
  FaBell, FaPlus, FaSearch 
} from 'react-icons/fa';
import { format } from 'date-fns';
import Navbar from '../Navabar/Navbar';

// Animation for loading and hover effects
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(74, 107, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(74, 107, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 107, 255, 0); }
`;

// Styled Components
const ReminderContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme === 'dark' ? '#121212' : '#f8fafc'};
  color: ${({ theme }) => theme === 'dark' ? '#f5f5f5' : '#333'};
  transition: all 0.3s ease-in-out;
  padding-bottom: 2rem;
      padding-top: 52px;
    padding-right: 20px;
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#2d3748'};
  margin: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #4a6bff, #6c5ce7);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const TitleIcon = styled.div`
  background: linear-gradient(135deg, #4a6bff, #6c5ce7);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(74, 107, 255, 0.3);
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-grow: 1;
  }
`;

const SearchInput = styled.input`
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#333' : '#ddd'};
  border-radius: 8px;
  background: ${({ theme }) => theme === 'dark' ? '#1e1e1e' : '#fff'};
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#333'};
  font-size: 0.95rem;
  width: 220px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4a6bff;
    box-shadow: 0 0 0 2px rgba(74, 107, 255, 0.2);
    width: 250px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    &:focus {
      width: 100%;
    }
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  color: ${({ theme }) => theme === 'dark' ? '#aaa' : '#777'};
`;

const AddButton = styled.button`
  padding: 0.7rem 1.2rem;
  background: linear-gradient(135deg, #4a6bff, #6c5ce7);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 10px rgba(74, 107, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(74, 107, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem;
    span {
      display: none;
    }
  }
`;

const TableContainer = styled.div`
  margin: 0 2rem;
  background: ${({ theme }) => theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)'};
  overflow-x: auto;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    margin: 0 1rem;
    border-radius: 12px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  min-width: 1000px;
  
  @media (min-width: 1200px) {
    min-width: auto;
    width: 100%;
  }
`;

const TableHeader = styled.thead`
  background: ${({ theme }) => theme === 'dark' 
    ? 'linear-gradient(90deg, #1a1a2e, #16213e)' 
    : 'linear-gradient(90deg, #f8f9fa, #e9ecef)'};
  border-bottom: 2px solid ${({ theme }) => theme === 'dark' ? '#333' : '#ddd'};
`;

const TableHeaderCell = styled.th`
  padding: 1rem 0.6rem;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#2d3748'};
  position: relative;
  white-space: nowrap;
  
  &:first-child {
    padding-left: 1rem;
  }
  
  &:last-child {
    padding-right: 4rem;
  }
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 1px;
    background: ${({ theme }) => theme === 'dark' ? '#444' : '#ddd'};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme === 'dark' ? '#333' : '#eee'};
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out;
  
  &:nth-child(even) {
    background: ${({ theme }) => theme === 'dark' ? 'rgba(30, 30, 30, 0.5)' : '#f8f9fa'};
  }
  
  &:hover {
    background: ${({ theme }) => theme === 'dark' ? '#2a2a2a' : '#f1f3f9'};
  }
`;

const TableCell = styled.td`
  padding: 0.8rem 0.6rem;
  vertical-align: middle;
  color: ${({ theme }) => theme === 'dark' ? '#e0e0e0' : '#4a5568'};
  word-break: break-word;
  
  &:first-child {
    padding-left: 1rem;
  }
  
  &:last-child {
    padding-right: 4rem;
  }
`;

const IconCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const TypeBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ type, theme }) => {
    if (theme === 'dark') {
      switch (type) {
        case 'work': return 'rgba(74, 107, 255, 0.2)';
        case 'meeting': return 'rgba(108, 92, 231, 0.2)';
        case 'appointment': return 'rgba(0, 184, 148, 0.2)';
        case 'personal': return 'rgba(253, 121, 168, 0.2)';
        default: return 'rgba(99, 110, 114, 0.2)';
      }
    } else {
      switch (type) {
        case 'work': return 'rgba(74, 107, 255, 0.1)';
        case 'meeting': return 'rgba(108, 92, 231, 0.1)';
        case 'appointment': return 'rgba(0, 184, 148, 0.1)';
        case 'personal': return 'rgba(253, 121, 168, 0.1)';
        default: return 'rgba(99, 110, 114, 0.1)';
      }
    }
  }};
  color: ${({ type, theme }) => {
    if (theme === 'dark') {
      switch (type) {
        case 'work': return '#4a6bff';
        case 'meeting': return '#6c5ce7';
        case 'appointment': return '#00b894';
        case 'personal': return '#fd79a8';
        default: return '#636e72';
      }
    } else {
      switch (type) {
        case 'work': return '#4a6bff';
        case 'meeting': return '#6c5ce7';
        case 'appointment': return '#00b894';
        case 'personal': return '#fd79a8';
        default: return '#636e72';
      }
    }
  }};
`;

const ActionCell = styled(TableCell)`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4a6bff, #6c5ce7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 36px;
  height: 36px;
  box-shadow: 0 2px 6px rgba(74, 107, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(74, 107, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (min-width: 768px) {
    padding: 0.5rem 0.8rem;
    min-width: auto;
    gap: 0.5rem;
  }
`;

const ActionText = styled.span`
  display: none;
  
  @media (min-width: 768px) {
    display: inline;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.2);
  
  &:hover {
    box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
  }
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme === 'dark' ? '#aaa' : '#718096'};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme === 'dark' 
    ? 'rgba(74, 107, 255, 0.1)' 
    : 'rgba(74, 107, 255, 0.05)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme === 'dark' ? '#4a6bff' : '#6c5ce7'};
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#2d3748'};
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  max-width: 400px;
  line-height: 1.6;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PopupContainer = styled.div`
  background: ${({ theme }) => theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transform: scale(0.95);
  animation: ${fadeIn} 0.3s ease-out forwards, ${pulse} 2s infinite;
  overflow: hidden;
`;

const PopupHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #4a6bff, #6c5ce7);
  color: white;
`;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const PopupContent = styled.div`
  padding: 1.5rem;
`;

const PopupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme === 'dark' ? '#ccc' : '#4a5568'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormInput = styled.input`
  padding: 0.9rem 1.2rem;
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#333' : '#ddd'};
  border-radius: 10px;
  background: ${({ theme }) => theme === 'dark' ? '#2a2a2a' : '#fff'};
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#333'};
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4a6bff;
    box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.9rem 1.2rem;
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#333' : '#ddd'};
  border-radius: 10px;
  background: ${({ theme }) => theme === 'dark' ? '#2a2a2a' : '#fff'};
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#333'};
  font-size: 0.95rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4a6bff;
    box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
  }
`;

const FormSelect = styled.select`
  padding: 0.9rem 1.2rem;
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#333' : '#ddd'};
  border-radius: 10px;
  background: ${({ theme }) => theme === 'dark' ? '#2a2a2a' : '#fff'};
  color: ${({ theme }) => theme === 'dark' ? '#f0f0f0' : '#333'};
  font-size: 0.95rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4a6bff;
    box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  background: linear-gradient(135deg, #4a6bff, #6c5ce7);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(74, 107, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(74, 107, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${({ theme }) => theme === 'dark' ? '#121212' : '#f8fafc'};
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${({ theme }) => theme === 'dark' ? '#333' : '#ddd'};
  border-top: 4px solid #4a6bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Popup = ({
  title: initialTitle,
  description: initialDescription,
  type: initialType,
  formattedDate,
  formattedTime,
  onClose,
  onSubmit,
  theme,
}) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [type, setType] = useState(initialType || '');
  const [date, setDate] = useState(formattedDate || '');
  const [time, setTime] = useState(formattedTime || '');

  const handleSubmit = (e) => {
    e.preventDefault();

    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);

    onSubmit({
      title,
      description,
      date: newDate,
      type,
    });

    onClose();
  };

  return (
    <Overlay>
      <PopupContainer theme={theme}>
        <PopupHeader>
          <PopupTitle>
            <FaBell /> Update Reminder
          </PopupTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </PopupHeader>
        <PopupContent>
          <PopupForm onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel theme={theme}>
                <FaCalendarAlt /> Date
              </FormLabel>
              <FormInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                theme={theme}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel theme={theme}>
                <FaClock /> Time
              </FormLabel>
              <FormInput
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                theme={theme}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel theme={theme}>Type</FormLabel>
              <FormSelect
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                theme={theme}
              >
                <option value="">Select a type</option>
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
              />
            </FormGroup>
            <FormGroup>
              <FormLabel theme={theme}>Description</FormLabel>
              <FormTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                theme={theme}
              />
            </FormGroup>
            <SubmitButton type="submit">Update Reminder</SubmitButton>
          </PopupForm>
        </PopupContent>
      </PopupContainer>
    </Overlay>
  );
};

function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReminders();
    loadSettings();
  }, []);

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

  const deleteReminder = async (reminderId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/deleteReminder/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete reminder');
      }
    
      setReminders((prevReminders) =>
        prevReminders.filter((reminder) => reminder.id !== reminderId)
      );
      console.log("hello")
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

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
      setReminders(response.data.reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const handleOpenPopup = (reminder) => {
    if (!reminder || !reminder.reminder_time) {
      console.error("Invalid reminder data:", reminder);
      return;
    }
  
    const date = new Date(reminder.reminder_time);
  
    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", reminder.reminder_time);
      return;
    }
  
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .padStart(5, '0');
  
    setSelectedReminder({
      ...reminder,
      formattedDate,
      formattedTime,
    });
  
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedReminder(null);
  };

  const handleUpdateReminder = async (updatedReminder) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:8082/updateReminder/${selectedReminder.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updatedReminder.title,
          description: updatedReminder.description,
          reminder_time: updatedReminder.date.toISOString(),
          type: updatedReminder.type,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update reminder");
      }
  
      fetchReminders();
      handleClosePopup();
    } catch (error) {
      console.error("Error updating reminder:", error.message);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reminder.title.toLowerCase().includes(searchLower) ||
      (reminder.description && reminder.description.toLowerCase().includes(searchLower)) ||
      reminder.type.toLowerCase().includes(searchLower) ||
      (reminder.name && reminder.name.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <LoadingContainer theme={theme}>
        <LoadingSpinner theme={theme} />
      </LoadingContainer>
    );
  }

  return (
    <ReminderContainer theme={theme}>
      <Navbar theme={theme} />
      <Header theme={theme}>
        <TitleContainer>
          <TitleIcon>
            <FaBell />
          </TitleIcon>
          <Title theme={theme}>Reminders</Title>
        </TitleContainer>
        
        <Controls>
          <SearchContainer>
            <SearchIcon theme={theme} />
            <SearchInput 
              type="text" 
              placeholder="Search reminders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
          </SearchContainer>
        </Controls>
      </Header>
      
      <TableContainer theme={theme}>
        <StyledTable>
          <TableHeader theme={theme}>
            <tr>
              <TableHeaderCell theme={theme} style={{ width: '15%' }}>
                <FaUser /> User
              </TableHeaderCell>
              <TableHeaderCell theme={theme} style={{ width: '20%' }}>Title</TableHeaderCell>
              <TableHeaderCell theme={theme} style={{ width: '25%' }}>Description</TableHeaderCell>
              <TableHeaderCell theme={theme} style={{ width: '10%' }}>Type</TableHeaderCell>
              <TableHeaderCell theme={theme} style={{ width: '15%' }}>
                <FaCalendarAlt /> Date & Time
              </TableHeaderCell>
        
              <TableHeaderCell theme={theme} style={{ width: '15%' }}>
                Actions
              </TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {filteredReminders.length > 0 ? (
              filteredReminders.map((reminder) => {
                const date = new Date(reminder.reminder_time);
                const formattedDate = format(date, 'MMM dd, yyyy');
                const formattedTime = format(date, 'hh:mm a');

                return (
                  <TableRow key={reminder.id} theme={theme}>
                    <IconCell theme={theme}>
                      <FaUser /> {reminder.name || "N/A"}
                    </IconCell>
                    <TableCell theme={theme}>
                      {reminder.title || "No Title"}
                    </TableCell>
                    <TableCell theme={theme}>
                      {reminder.description || "No Description"}
                    </TableCell>
                    <TableCell theme={theme}>
                      <TypeBadge 
                        type={reminder.type ? reminder.type.toLowerCase() : ''} 
                        theme={theme}
                      >
                        {reminder.type || "No Type"}
                      </TypeBadge>
                    </TableCell>
                    <TableCell theme={theme}>
                      {formattedDate}  {formattedTime}
                    </TableCell>
                    
                    <ActionCell theme={theme}>
                      <ActionButton 
                        theme={theme}
                        onClick={() => handleOpenPopup(reminder)}
                        title="Edit"
                      >
                        <FaEdit />
                        <ActionText>Edit</ActionText>
                      </ActionButton>
                      <DeleteButton 
                        theme={theme}
                        onClick={() => deleteReminder(reminder.id)}
                        title="Delete"
                      >
                        <FaTrash />
                        <ActionText>Delete</ActionText>
                      </DeleteButton>
                    </ActionCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow theme={theme}>
                <TableCell colSpan="7" theme={theme}>
                  <EmptyState theme={theme}>
                    <EmptyIcon theme={theme}>
                      <FaBell />
                    </EmptyIcon>
                    <EmptyTitle theme={theme}>No reminders found</EmptyTitle>
                    <EmptyText theme={theme}>
                      {searchTerm 
                        ? `No reminders match your search for "${searchTerm}"`
                        : "You don't have any reminders yet."}
                    </EmptyText>
                  </EmptyState>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>

      {isPopupOpen && selectedReminder && (
        <Popup
          title={selectedReminder.title}
          description={selectedReminder.description}
          type={selectedReminder.type}
          formattedDate={selectedReminder.formattedDate}
          formattedTime={selectedReminder.formattedTime}
          onClose={handleClosePopup}
          onSubmit={handleUpdateReminder}
          theme={theme}
        />
      )}
    </ReminderContainer>
  );
}

export default Reminder;