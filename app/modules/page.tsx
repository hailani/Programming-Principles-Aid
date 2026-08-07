'use client'
import { useState } from 'react'
import { Inter } from '@next/font/google'
import Modal from 'react-modal' 
import styles from './page.module.css'

const inter = Inter({ subsets: ['latin'] })

const modules = [
  { key: 'data-types', label: 'Data Types', icon: 'datatype' },
  { key: 'conditionals', label: 'Conditionals', icon: 'conditionals' },
  { key: 'loops', label: 'Loops', icon: 'loop' },
  { key: 'arrays', label: 'Arrays', icon: 'array' },
]
// added difficulties for the difficulty selection modal
const difficulties = [
  { key: 'easy', label: 'Easy', color: '#28a745' },
  { key: 'medium', label: 'Medium', color: '#ffc107' },
  { key: 'hard', label: 'Hard', color: '#dc3545' },
]

export default function Modules() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('');

  // Opens modal and tracks which module was selected
  const openDifficultySelection = (moduleKey: string) => {
    setActiveModule(moduleKey);
    setIsModalOpen(true);
  };

  return (
    <main className={`${styles.page} ${inter.className}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Choose a Topic</h1>

        <section className={styles.grid} aria-label="Topic selection">
          {modules.map((module) => (
            <button
              key={module.key}
              onClick={() => openDifficultySelection(module.key)}
              className={styles.card}
              
            >
              <span className={`${styles.icon} ${styles[module.icon]}`} />
              <span className={styles.cardLabel}>{module.label}</span>
            </button>
          ))}
        </section>

        <a href="/" className={styles.backButton}>Back</a>
      </div>

      {/* Difficulty Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false} // Only use this if you haven't set an app element
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#1a1a2e',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center',
            color: 'white'
          }
        }}
      >
        <h2>Select Difficulty</h2>
        <p style={{ color: '#8b949e', marginBottom: '20px' }}>
          Choose a level for <strong>{activeModule.replace('-', ' ')}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {difficulties.map((diff) => (
             <a
               key={diff.key}
               /* This sends the user to the selection list page.
                  Example URL: /problems?module=loops&difficulty=medium 
               */
               href={`/problems?module=${activeModule}&difficulty=${diff.key}`}
               style={{
                 backgroundColor: diff.color,
                 color: 'white',
                 padding: '12px 40px',
                 borderRadius: '8px',
                 textDecoration: 'none',
                 fontWeight: 'bold',
                 transition: 'transform 0.2s'
               }}
               onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
               onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
             >
               {diff.label}
             </a>
           ))}
          </div>

        <button 
          onClick={() => setIsModalOpen(false)}
          style={{ marginTop: '20px', background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </Modal>
    </main>
  )
}