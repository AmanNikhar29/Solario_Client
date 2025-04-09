import React, { useState } from 'react';
import './Favo.css';

const FavoritesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const favorites = [
    {
      id: 1,
      title: 'Design Systems',
      category: 'books',
      description: 'Alla Kholmatova - Great resource for building consistent UIs',
      image: 'https://m.media-amazon.com/images/I/41yafGMO+rL._SY425_.jpg',
      link: 'https://example.com'
    },
    {
      id: 2,
      title: 'Figma',
      category: 'tools',
      description: 'My primary design tool for UI/UX work',
      image: 'https://static.figma.com/app/icon/1/icon-192.png',
      link: 'https://figma.com'
    },
    {
      id: 3,
      title: 'React.js',
      category: 'tools',
      description: 'JavaScript library for building user interfaces',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1280px-React-icon.svg.png',
      link: 'https://reactjs.org'
    },
    {
      id: 4,
      title: 'Atomic Habits',
      category: 'books',
      description: 'James Clear - Fantastic book on building good habits',
      image: 'https://m.media-amazon.com/images/I/51B7kuFwQFL._SY425_.jpg',
      link: 'https://example.com'
    },
    {
      id: 5,
      title: 'VS Code',
      category: 'tools',
      description: 'My code editor of choice with great extensions',
      image: 'https://code.visualstudio.com/assets/images/code-stable.png',
      link: 'https://code.visualstudio.com'
    },
    {
      id: 6,
      title: 'Notion',
      category: 'tools',
      description: 'All-in-one workspace for notes, docs, and planning',
      image: 'https://www.notion.so/cdn-cgi/image/format=auto,width=640,quality=100/front-static/shared/icons/notion-app-icon-3d.png',
      link: 'https://notion.so'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Favorites' },
    { id: 'tools', name: 'Tools' },
    { id: 'books', name: 'Books' }
  ];

  const filteredFavorites = activeCategory === 'all' 
    ? favorites 
    : favorites.filter(item => item.category === activeCategory);

  return (
    <div className="favorites-container">
      <header className="favorites-header">
        <h1>My Favorite Things</h1>
        <p className="subtitle">A collection of tools, books, and resources I love</p>
      </header>

      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="favorites-grid">
        {filteredFavorites.map(item => (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="favorite-card" 
            key={item.id}
          >
            <div className="card-image">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="category-badge">{item.category}</span>
            </div>
          </a>
        ))}
      </div>

      <footer className="favorites-footer">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default FavoritesPage;