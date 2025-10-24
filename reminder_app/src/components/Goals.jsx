import React, { useState, useEffect } from 'react';
import Navbar from '../Navabar/Navbar';
import styled, { keyframes } from 'styled-components';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaCalendarDay, 
  FaChartPie,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Popup = styled.div`
  position: absolute;
  background: ${({ theme }) => (theme === "dark" ? "#333" : "#fff")};
  color: ${({ theme }) => (theme === "dark" ? "#fff" : "#000")};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 9999;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  border: 1px solid ${({ theme }) => (theme === "dark" ? "#555" : "#ddd")};
  
  top: ${({ y }) => y}px;
  left: ${({ x }) => x}px;
`;

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  margin-top: 70px;
  background-color: ${({ theme }) => theme === 'dark' ? '#121212' : '#f5f7fa'};
  min-height: calc(100vh - 70px);
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  height: 80vh;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: auto;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, ${({ theme }) => theme === 'dark' ? '0.3' : '0.1'});
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, ${({ theme }) => theme === 'dark' ? '0.4' : '0.15'});
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme === 'dark' ? '#aaa' : '#666'};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  background: ${({ color }) => color};
`;

const CardValue = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme === 'dark' ? '#fff' : '#333'};
  margin: 1.5rem 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: ${({ positive, theme }) => 
    positive ? 
      (theme === 'dark' ? '#4ade80' : '#22c55e') : 
      (theme === 'dark' ? '#f87171' : '#ef4444')};
  font-weight: 600;
  
  svg {
    margin-right: 0.5rem;
    font-size: 1.5rem;
  }
`;

const ChartContainer = styled.div`
  width: 200px;
  height: 100px;
  display: flex;
  align-items: flex-end;
`;

const Bar = styled.div`
  width: 30px;
  height: ${({ height }) => height}%;
  background: ${({ color }) => color};
  margin-right: 10px;
  border-radius: 8px;
  transition: height 0.5s ease;
`;

const PieChartContainer = styled.div`
  width: 150px;
  height: 150px;
  margin: 0 auto;
  position: relative;
`;

const PieChart = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #4f46e5 0% ${({ work }) => work}%,
    #10b981 ${({ work }) => work}% ${({ work, personal }) => work + personal}%,
    #3b82f6 ${({ work, personal }) => work + personal}% ${({ work, personal, meeting }) => work + personal + meeting}%,
    #f59e0b ${({ work, personal, meeting }) => work + personal + meeting}% 100%
  );
`;

const Legend = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  
  span {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 3px;
    margin-right: 0.5rem;
    background: ${({ color }) => color};
  }
`;

function Goals() {
  const [hoveredType, setHoveredType] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const [counts, setCounts] = useState({
    work: 0,
    personal: 0,
    meeting: 0,
    appointment: 0,
  });

  const [theme, setTheme] = useState('light');
  const [stats, setStats] = useState({
    userCount: 0,
    eventTypes: { work: 0, personal: 0, meeting: 0, appointment: 0 },
    yearlyReminders: 0,
    dailyReminders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from backend
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

  // Fetch user count
  const fetchUserCount = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch('http://localhost:8082/user-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        setStats(prev => {
          if (prev.userCount !== data.count) {
            return { ...prev, userCount: data.count };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fetch event distribution
  const fetchEventDistribution = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:8082/eventD-count", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Transform results (array) into an object keyed by type
      const typeCounts = {};
      data.counts.forEach((row) => {
        typeCounts[row.type.toLowerCase()] = row.count;
      });

      // Update your state
      setCounts((prev) => ({
        ...prev,
        ...typeCounts,
      }));
    } catch (error) {
      console.error("Error fetching event distribution:", error);
    }
  };

  // Fetch yearly reminders count
  const fetchYearlyReminders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch('http://localhost:8082/YearlyR-count', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Yearly reminders data:', data);
        
        // Extract the count from the response
        const yearlyCount = data.year?.[0]?.reminder_count || 0;
        
        setStats(prev => {
          if (prev.yearlyReminders !== yearlyCount) {
            return { ...prev, yearlyReminders: yearlyCount };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching yearly reminders:', error);
    }
  };

  // Fetch daily reminders count
  const fetchDailyReminders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch('http://localhost:8082/DailyR-count', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Daily reminders data:', data);
        
        // Extract the count from the response
        const dailyCount = data.day?.[0]?.reminder_count || 0;
        
        setStats(prev => {
          if (prev.dailyReminders !== dailyCount) {
            return { ...prev, dailyReminders: dailyCount };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching daily reminders:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserCount();
      await fetchEventDistribution();
      await fetchYearlyReminders();
      await fetchDailyReminders();
    };

    // Initial fetch
    fetchData();

    // Then fetch every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadSettings();
    
    const generateData = () => {
      setStats((prev) => ({
        ...prev,
        eventTypes: {
          work: Math.floor(Math.random() * 120) + 30,
          personal: Math.floor(Math.random() * 100) + 20,
          meeting: Math.floor(Math.random() * 80) + 15,
          appointment: Math.floor(Math.random() * 60) + 10,
        },
        // Removed mock data for both yearly and daily reminders
        // They will now use real data from the backend
      }));
    };

    generateData();
    const interval = setInterval(generateData, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePieHover = (e, type) => {
    const count = counts[type];
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    setHoveredType(type);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pieContainer = e.currentTarget.parentElement.parentElement;
    const pieRect = pieContainer.getBoundingClientRect();
    
    // Calculate position relative to mouse within pie chart
    const x = e.nativeEvent.offsetX + 10;
    const y = e.nativeEvent.offsetY - 10;
    
    setTooltip({
      visible: true,
      text: `${label}: ${count}`,
      x: x,
      y: y
    });
  };

  const handlePieLeave = () => {
    setHoveredType(null);
    setTooltip({ visible: false, text: "", x: 0, y: 0 });
  };

  // Calculate percentages for pie chart
  const total = counts.work + counts.personal + counts.meeting + counts.appointment;

  const workPercent = total ? (counts.work / total) * 100 : 0;
  const personalPercent = total ? (counts.personal / total) * 100 : 0;
  const meetingPercent = total ? (counts.meeting / total) * 100 : 0;
  const appointmentPercent = total ? (counts.appointment / total) * 100 : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar theme={theme} />
      <DashboardContainer theme={theme}>
        <GridContainer>
          {/* User Count Card */}
          <StatCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>Total Users</CardTitle>
              <CardIcon color="#4f46e5">
                <FaUsers />
              </CardIcon>
            </CardHeader>
            <CardValue theme={theme}>
              {stats.userCount.toLocaleString()}
            </CardValue>
            <CardFooter>
              <TrendIndicator positive={true} theme={theme}>
                {/* <FaArrowUp /> +12.5% */}
              </TrendIndicator>
              <ChartContainer>
                {[30, 50, 70, 90, 60, 40].map((height, i) => (
                  <Bar
                    key={i}
                    height={height}
                    color="#4f46e5"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </ChartContainer>
            </CardFooter>
          </StatCard>

          {/* Event Types Card */}
          <StatCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>Event Distribution/User</CardTitle>
              <CardIcon color="#10b981">
                <FaChartPie />
              </CardIcon>
            </CardHeader>

            <PieChartContainer>
              <PieChart
                work={workPercent}
                personal={personalPercent}
                meeting={meetingPercent}
                appointment={appointmentPercent}
              />

              {/* Hover overlays */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                }}
              >
                {/* Work segment (top right) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `polygon(50% 50%, 100% 50%, 100% 0, 50% 0)`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => handlePieHover(e, "work")}
                  onMouseMove={(e) => handlePieHover(e, "work")}
                  onMouseLeave={handlePieLeave}
                />
                {/* Personal segment (bottom right) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => handlePieHover(e, "personal")}
                  onMouseMove={(e) => handlePieHover(e, "personal")}
                  onMouseLeave={handlePieLeave}
                />
                {/* Meeting segment (bottom left) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `polygon(50% 50%, 0 50%, 0 100%, 50% 100%)`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => handlePieHover(e, "meeting")}
                  onMouseMove={(e) => handlePieHover(e, "meeting")}
                  onMouseLeave={handlePieLeave}
                />
                {/* Appointment segment (top left) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `polygon(50% 50%, 0 50%, 0 0, 50% 0)`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => handlePieHover(e, "appointment")}
                  onMouseMove={(e) => handlePieHover(e, "appointment")}
                  onMouseLeave={handlePieLeave}
                />
              </div>

              {/* Tooltip */}
              {tooltip.visible && (
                <Popup theme={theme} x={tooltip.x} y={tooltip.y}>
                  {tooltip.text}
                </Popup>
              )}
            </PieChartContainer>

            <Legend>
              <LegendItem color="#4f46e5">
                <span></span> Work
              </LegendItem>
              <LegendItem color="#10b981">
                <span></span> Personal
              </LegendItem>
              <LegendItem color="#3b82f6">
                <span></span> Meeting
              </LegendItem>
              <LegendItem color="#f59e0b">
                <span></span> Appointment
              </LegendItem>
            </Legend>
          </StatCard>

          {/* Yearly Reminders Card */}
          <StatCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>Yearly Reminders/User</CardTitle>
              <CardIcon color="#3b82f6">
                <FaCalendarAlt />
              </CardIcon>
            </CardHeader>
            <CardValue theme={theme}>
              {stats.yearlyReminders.toLocaleString()}
            </CardValue>
            <CardFooter>
              <TrendIndicator positive={false} theme={theme}>
                {/* <FaArrowDown /> -3.2% */}
              </TrendIndicator>
              <ChartContainer>
                {[20, 45, 30, 60, 40, 75, 50].map((height, i) => (
                  <Bar
                    key={i}
                    height={height}
                    color="#3b82f6"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </ChartContainer>
            </CardFooter>
          </StatCard>

          {/* Daily Reminders Card */}
          <StatCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>Daily Reminders/User</CardTitle>
              <CardIcon color="#f59e0b">
                <FaCalendarDay />
              </CardIcon>
            </CardHeader>
            <CardValue theme={theme}>{stats.dailyReminders}</CardValue>
            <CardFooter>
              <TrendIndicator positive={true} theme={theme}>
                {/* <FaArrowUp /> +8.7% */}
              </TrendIndicator>
              <ChartContainer>
                {[40, 60, 30, 70, 50, 80].map((height, i) => (
                  <Bar
                    key={i}
                    height={height}
                    color="#f59e0b"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </ChartContainer>
            </CardFooter>
          </StatCard>
        </GridContainer>
      </DashboardContainer>
    </>
  );
}

export default Goals;