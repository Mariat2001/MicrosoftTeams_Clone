import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaBars, FaTimes, FaSignOutAlt, FaHome, FaBell, FaCog, FaBullseye } from 'react-icons/fa';

// Animation for navbar items
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

// Styled Components
const NavbarContainer = styled.nav`
  background: ${({ theme }) => theme === 'dark' ? '#1a1a2e' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  span {
    background: white;
    color: ${({ theme }) => theme === 'dark' ? '#1a1a2e' : '#764ba2'};
    padding: 0.2rem 0.5rem;
    border-radius: 8px;
    font-size: 1.2rem;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: ${({ isOpen }) => isOpen ? '0' : '-100%'};
    width: 70%;
    height: 100vh;
    background: ${({ theme }) => theme === 'dark' ? '#16213e' : '#4a6bff'};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: right 0.3s ease;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    animation: ${slideIn} 0.3s ease-out;
  }
`;

const NavItem = styled.li`
  position: relative;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: ${({ delay }) => delay * 0.1}s;
  
  &:hover::after {
    width: 100%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: white;
    transition: width 0.3s ease;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 1rem;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1002;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const CloseButton = styled(FaTimes)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  font-size: 1.8rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1000;
  opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

function Navbar({ theme = 'light' }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8082/logout");
      sessionStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err.response?.data?.message || "Logout failed");
    }
  };

  return (
    <>
      <NavbarContainer theme={theme} className={scrolled ? 'scrolled' : ''}>
        <NavContent>
          <Logo to="/Home" theme={theme}>
            <span>Task</span>Flow
          </Logo>

          <MobileMenuButton onClick={toggleMobileMenu}>
            <FaBars />
          </MobileMenuButton>

          <NavMenu isOpen={isMobileMenuOpen}>
            <CloseButton onClick={closeMobileMenu} />
            
            <NavItem delay={0}>
              <NavLink to="/Home" onClick={closeMobileMenu}>
                <FaHome /> Home
              </NavLink>
            </NavItem>
            
            <NavItem delay={1}>
              <NavLink to="/Reminder" onClick={closeMobileMenu}>
                <FaBell /> Reminders
              </NavLink>
            </NavItem>
            
            <NavItem delay={2}>
              <NavLink to="/Goals" onClick={closeMobileMenu}>
                <FaBullseye /> Goals
              </NavLink>
            </NavItem>
            
            <NavItem delay={3}>
              <NavLink to="/Settings" onClick={closeMobileMenu}>
                <FaCog /> Settings
              </NavLink>
            </NavItem>
            
            <NavItem delay={4}>
              <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </LogoutButton>
            </NavItem>
          </NavMenu>
        </NavContent>
      </NavbarContainer>

      <Overlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
    </>
  );
}

export default Navbar;