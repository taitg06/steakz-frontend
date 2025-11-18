import React from 'react';
import './MenuHighlights.css';

const menuItems = [
  {
    title: 'Tomahawk Ribeye',
    desc: 'Richly marbled, grilled to perfection, served with garlic butter.',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
    price: '$65'
  },
  {
    title: 'Filet Mignon',
    desc: 'Tender center cut, red wine reduction, seasonal vegetables.',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    price: '$48'
  },
  {
    title: 'Wagyu Sirloin',
    desc: 'Premium Japanese beef, sea salt finish, truffle mashed potatoes.',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    price: '$120'
  },
];

const MenuHighlights: React.FC = () => (
  <section className="menu-highlights-saviese">
    <h2>Menu Highlights</h2>
    <div className="menu-cards">
      {menuItems.map((item) => (
        <div className="menu-card" key={item.title}>
          <div
            className="menu-card-img"
            role="img"
            aria-label={item.title}
            style={{ backgroundImage: `url(${item.img})` }}
          />
          <div className="menu-card-content">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <div className="menu-card-price">{item.price}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default MenuHighlights;
