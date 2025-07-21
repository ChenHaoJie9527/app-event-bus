import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Examples from './components/Examples'
import Api from './components/Api'
import Guide from './components/Guide'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Examples />
        <Api />
        <Guide />
      </main>
      <Footer />
    </>
  )
}

export default App 