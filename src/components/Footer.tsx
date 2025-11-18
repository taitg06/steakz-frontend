import React from 'react';
import './Footer.css';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import Logo from './Logo';

const Footer: React.FC = () => (
  <footer className="footer-saviese">
    <div className="footer-top">
      <Logo />
    </div>
    <div className="footer-content">
      <div className="footer-section">
        <h3>Contact</h3>
        <p>123 Soul St, Food City</p>
        <p>Phone: (555) 123-4567</p>
        <p>Email: info@soulsteaks.com</p>
      </div>
      <div className="footer-section">
        <h3>Hours</h3>
        <p>Mon-Fri: 12pm - 10pm</p>
        <p>Sat: 1pm - 11pm</p>
        <p>Sun: Closed</p>
      </div>
      <div className="footer-section">
        <h3>Follow Us</h3>
        <div className="footer-socials">
          <a href="https://instagram.com" aria-label="Instagram" className="footer-icon" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://facebook.com" aria-label="Facebook" className="footer-icon" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">© 2025 Soul Steaks. All rights reserved.</div>
  </footer>
);

export default Footer;
