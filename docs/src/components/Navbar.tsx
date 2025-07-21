import React from 'react'

const Navbar: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>EventBus</h1>
          <span className="version">v1.0.0</span>
        </div>
        <ul className="nav-menu">
          <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>Home</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features') }}>Features</a></li>
          <li><a href="#examples" onClick={(e) => { e.preventDefault(); scrollToSection('examples') }}>Examples</a></li>
          <li><a href="#api" onClick={(e) => { e.preventDefault(); scrollToSection('api') }}>API</a></li>
          <li><a href="#guide" onClick={(e) => { e.preventDefault(); scrollToSection('guide') }}>Guide</a></li>
          <li><a href="https://github.com/your-repo" target="_blank" rel="noopener">GitHub</a></li>
        </ul>
        <button className="nav-toggle" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar 