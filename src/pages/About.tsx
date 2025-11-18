import React from 'react';
import './About.css';

const About: React.FC = () => (
  <section className="about-page">
    {/* Hero Section */}
    <div className="about-hero">
      <div className="about-hero-overlay"></div>
      <div className="about-hero-content">
        <h1 className="about-title">About Soul Steaks</h1>
        <p className="about-subtitle">Where passion for steak meets soulful hospitality</p>
      </div>
    </div>

    {/* Story Section */}
    <div className="about-container">
      <div className="about-story">
        <div className="story-text">
          <h2>Our Story</h2>
          <p>
            Welcome to <strong>Soul Steaks</strong>, where passion for steak meets soulful hospitality. 
            Our story began with a love for premium cuts and a dedication to the art of grilling. 
            At Soul Steaks, we blend warmth and flavor to create memorable meals.
          </p>
          <p>
            Our chefs source only the finest beef, including Japanese Wagyu and locally aged steaks, 
            prepared to perfection. We believe in quality, tradition, and creating memorable experiences 
            for every guest.
          </p>
          <p>
            Join us for a culinary journey that celebrates the best of steak and soulful hospitality. 
            Thank you for making Soul Steaks your destination for unforgettable meals.
          </p>
        </div>
        <div className="story-image">
          <img 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" 
            alt="Restaurant Interior"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="about-values">
        <h2 className="values-title">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🥩</div>
            <h3>Premium Quality</h3>
            <p>We source only the finest cuts from trusted suppliers, ensuring exceptional taste in every bite.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🔥</div>
            <h3>Perfect Preparation</h3>
            <p>Our master chefs bring decades of experience to every dish, grilling each steak to perfection.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">❤️</div>
            <h3>Soulful Service</h3>
            <p>We treat every guest like family, creating warm and welcoming dining experiences.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌟</div>
            <h3>Memorable Moments</h3>
            <p>Every meal at Soul Steaks is crafted to create lasting memories and exceptional experiences.</p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="about-gallery">
        <h2 className="gallery-title">Experience Soul Steaks</h2>
        <div className="gallery-grid">
          <div className="gallery-item">
            <img 
              src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80" 
              alt="Elegant Dining Room"
            />
          </div>
          <div className="gallery-item">
            <img 
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80" 
              alt="Chef Preparing Steak"
            />
          </div>
          <div className="gallery-item">
            <img 
              src="https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600&q=80" 
              alt="Wine Selection"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default About;
