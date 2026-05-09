import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section className="flex flex-col grow place-content-center place-items-center gap-[18px] lg:gap-[25px] px-5 py-8 lg:p-0">
        <div className="relative w-full flex justify-center">
          <img
            src={heroImg}
            className="relative z-0 w-[170px] inset-x-0 mx-auto"
            alt=""
          />
          <img
            src={reactLogo}
            className="absolute z-10 top-[34px] h-[28px] inset-x-0 mx-auto [transform:perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute z-0 top-[107px] h-[26px] w-auto inset-x-0 mx-auto [transform:perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
            alt="Vite logo"
          />
        </div>
        
        <div className="text-center">
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>

        <button
          type="button"
          className="text-base px-2.5 py-1.5 mb-6 rounded-[5px] text-[var(--accent)] bg-[var(--accent-bg)] border-2 border-transparent transition-colors duration-300 hover:border-[var(--accent-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      {/* Ticks */}
      <div className="relative w-full before:content-[''] before:absolute before:-top-[4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-[var(--border)] after:content-[''] after:absolute after:-top-[4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-[var(--border)]"></div>

      <section className="flex flex-col lg:flex-row border-t border-[var(--border)] text-center lg:text-left w-full">
        {/* Docs Column */}
        <div className="flex-1 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[var(--border)]">
          <svg className="mb-4 w-[22px] h-[22px] mx-auto lg:mx-0" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul className="list-none p-0 grid grid-cols-2 lg:flex lg:flex-row gap-2 mt-5 lg:mt-8">
            <li>
              <a 
                href="https://vite.dev/" 
                target="_blank"
                className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1.5 text-base text-[var(--text-h)] bg-[var(--social-bg)] rounded-md no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)]"
              >
                <img className="h-[18px]" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a 
                href="https://react.dev/" 
                target="_blank"
                className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1.5 text-base text-[var(--text-h)] bg-[var(--social-bg)] rounded-md no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)]"
              >
                <img className="w-[18px] h-[18px]" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        {/* Social Column */}
        <div className="flex-1 p-6 lg:p-8">
          <svg className="mb-4 w-[22px] h-[22px] mx-auto lg:mx-0" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul className="list-none p-0 grid grid-cols-2 lg:flex lg:flex-row gap-2 mt-5 lg:mt-8">
            <li>
              <a 
                href="https://github.com/vitejs/vite" 
                target="_blank"
                className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1.5 text-base text-[var(--text-h)] bg-[var(--social-bg)] rounded-md no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)]"
              >
                <svg className="w-[18px] h-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a 
                href="https://chat.vite.dev/" 
                target="_blank"
                className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1.5 text-base text-[var(--text-h)] bg-[var(--social-bg)] rounded-md no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)]"
              >
                <svg className="w-[18px] h-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a 
                href="https://x.com/vite_js" 
                target="_blank"
                className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1.5 text-base text-[var(--text-h)] bg-[var(--social-bg)] rounded-md no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)]"
              >
                <svg className="w-[18px] h-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a 
                href="https://bsky.app/profile/vite.dev" 
                target="_blank"
                className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 px-3 py-1.5 text-base text-[var(--text-h)] bg-[var(--social-bg)] rounded-md no-underline transition-shadow duration-300 hover:shadow-[var(--shadow)]"
              >
                <svg className="w-[18px] h-[18px]" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="relative w-full before:content-[''] before:absolute before:-top-[4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-[var(--border)] after:content-[''] after:absolute after:-top-[4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-[var(--border)]"></div>
      
      {/* Spacer */}
      <section className="h-[48px] lg:h-[88px] border-t border-[var(--border)] w-full"></section>
    </>
  )
}

export default App