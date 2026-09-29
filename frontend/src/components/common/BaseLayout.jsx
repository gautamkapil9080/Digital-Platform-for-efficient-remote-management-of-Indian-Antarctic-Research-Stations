import { Link, useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { useAuth } from '../../context/AuthContext';
import './BaseLayout.css';

export default function BaseLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate('/');
    }
  };

  const renderAuthActions = () => {
    if (user) {
      return (
        <div className="navbar-user-area">
          <div className="operator-profile">
            <div className="profile-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20C5.8 16.7 8.1 15 12 15C15.9 15 18.2 16.7 19 20" />
              </svg>
            </div>

            <div className="operator-details">
              <span className="operator-status">
                <span className="status-dot online"></span>
                OPERATOR ACTIVE
              </span>

              <span className="operator-name">
                {user.username || user.name || 'Operator'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>Logout</span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 17L15 12L10 7" />
              <path d="M15 12H4" />
              <path d="M20 4V20" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div className="navbar-user-area">
        <div className="operator-profile logged-out">
          <div className="profile-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20C5.8 16.7 8.1 15 12 15C15.9 15 18.2 16.7 19 20" />
            </svg>
          </div>

          <div className="operator-details">
            <span className="operator-status offline-status">
              <span className="status-dot offline"></span>
              SYSTEM OFFLINE
            </span>

            <span className="operator-name">
              Guest Access
            </span>
          </div>
        </div>

        <button
          type="button"
          className="login-button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    );
  };

  return (
    <div className="app-shell">

      {/* ================= NAVBAR ================= */}

      <header className="top-navbar">

        <Link to="/" className="navbar-brand">
          <div className="brand-name">
            Code<span>Pulse</span>
          </div>
        </Link>

        <div className="navbar-project">
          <div className="project-name">
            Dhruv<span>Setu</span>
          </div>

          <div className="project-subtitle">
            NCPOR · Ministry of Earth Sciences
          </div>
        </div>

        <div className="navbar-right">

          <div className="sih-badge">
            <span className="sih-dot"></span>
            SIH 2026
          </div>

          {renderAuthActions()}

        </div>
      </header>


      {/* ================= PAGE ================= */}

      {children ? (
        <main className="page-content">
          {children}
        </main>
      ) : (
        <main className="home-page">

          {/* ================= HERO ================= */}

          <section className="digital-twin-section">

            <div className="spline-container">
              <Spline
                scene="https://prod.spline.design/a7pxykqwfmeBIE3M/scene.splinecode"
              />
            </div>

            <div className="hero-background-overlay"></div>

            <div className="hero-overlay">

              <div className="hero-badge">
                <span className="live-dot"></span>
                LIVE DIGITAL TWIN
              </div>

              <h1>
                Antarctic
                <br />
                <span>Station Intelligence</span>
              </h1>

              <p>
                Explore and monitor India's Antarctic research
                stations through an interactive digital twin
                environment.
              </p>

              <div className="hero-buttons">

                <Link
                  to="/view"
                  className="hero-button primary"
                >
                  <span>Explore Station</span>
                  <span className="button-arrow">→</span>
                </Link>

                <Link
                  to="/environment"
                  className="hero-button secondary"
                >
                  <span>Environment Data</span>
                  <span className="button-arrow">→</span>
                </Link>

              </div>

              <div className="hero-stats">

                <div className="stat-card">
                  <span className="stat-label">
                    STATUS
                  </span>

                  <div className="stat-value">
                    <span className="active-light"></span>
                    ONLINE
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-label">
                    REGION
                  </span>

                  <div className="stat-value">
                    <span className="region-icon">◈</span>
                    ANTARCTICA
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-label">
                    SYSTEM
                  </span>

                  <div className="stat-value">
                    <span className="active-light"></span>
                    ACTIVE
                  </div>
                </div>

              </div>

            </div>


            {/* ================= WEATHER ================= */}

            <div className="weather-card weather-card-one">
              <div className="weather-icon">❄</div>

              <div className="weather-content">
                <span>Temperature</span>
                <strong>-24°C</strong>
              </div>
            </div>

            <div className="weather-card weather-card-two">
              <div className="weather-icon">◌</div>

              <div className="weather-content">
                <span>Wind Speed</span>
                <strong>18 km/h</strong>
              </div>
            </div>

            <div className="weather-card weather-card-three">
              <div className="weather-icon">◇</div>

              <div className="weather-content">
                <span>Visibility</span>
                <strong>12.4 km</strong>
              </div>
            </div>

            <div className="ambient-glow"></div>

            <div className="snow snow-one"></div>
            <div className="snow snow-two"></div>
            <div className="snow snow-three"></div>
            <div className="snow snow-four"></div>

          </section>


          {/* ================= INTELLIGENCE ================= */}

          <section className="intelligence-section">

            <div className="section-heading">

              <div>
                <span className="section-tag">
                  STATION MONITORING
                </span>

                <h2>
                  Antarctic Intelligence
                </h2>
              </div>

              <span className="live-indicator">
                <span className="section-online-dot"></span>
                SYSTEM ONLINE
              </span>

            </div>


            <div className="environment-grid">

              <Link
                to="/environment"
                className="environment-card"
              >
                <div className="environment-card-top">
                  <span>Environment</span>
                  <span className="card-arrow">↗</span>
                </div>

                <strong>−24°C</strong>

                <small>
                  Temperature monitoring
                </small>

                <span className="card-action">
                  Open module →
                </span>
              </Link>


              <Link
                to="/energy"
                className="environment-card"
              >
                <div className="environment-card-top">
                  <span>Energy</span>
                  <span className="card-arrow">↗</span>
                </div>

                <strong>87%</strong>

                <small>
                  Station energy availability
                </small>

                <span className="card-action">
                  Open module →
                </span>
              </Link>


              <Link
                to="/logistics"
                className="environment-card"
              >
                <div className="environment-card-top">
                  <span>Logistics</span>
                  <span className="card-arrow">↗</span>
                </div>

                <strong>ACTIVE</strong>

                <small>
                  Supply operations
                </small>

                <span className="card-action">
                  Open module →
                </span>
              </Link>


              <Link
                to="/alerts"
                className="environment-card"
              >
                <div className="environment-card-top">
                  <span>Alerts</span>
                  <span className="card-arrow">↗</span>
                </div>

                <strong>02</strong>

                <small>
                  Active station alerts
                </small>

                <span className="card-action">
                  Open module →
                </span>
              </Link>

            </div>

          </section>

        </main>
      )}


      {/* ================= FOOTER ================= */}

      <Footer />

    </div>
  );
}


/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-main">

        <div className="footer-brand-block">

          <div className="footer-brand">
            Code<span>Pulse</span>
          </div>

          <p>
            Building digital intelligence for safer,
            smarter Antarctic research operations.
          </p>

        </div>


        <div className="footer-column">

          <span className="footer-heading">
            PLATFORM
          </span>

          <Link to="/">
            Home
          </Link>

          <Link to="/view">
            Station Overview
          </Link>

          <Link to="/environment">
            Environment
          </Link>

        </div>


        <div className="footer-column">

          <span className="footer-heading">
            MONITORING
          </span>

          <Link to="/energy">
            Energy
          </Link>

          <Link to="/infrastructure">
            Infrastructure
          </Link>

          <Link to="/logistics">
            Logistics
          </Link>

          <Link to="/alerts">
            Alerts
          </Link>

        </div>


        <div className="footer-column">

          <span className="footer-heading">
            PROJECT
          </span>

          <span>
            DhruvSetu
          </span>

          <span>
            SIH 2026
          </span>

          <span>
            NCPOR
          </span>

          <span>
            Ministry of Earth Sciences
          </span>

        </div>

      </div>


      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()} CodePulse. All rights reserved.
        </span>

        <span className="footer-sih">
          Built with purpose for SIH 2026
        </span>

        <span>
          DhruvSetu · Antarctic Station Intelligence Platform
        </span>

      </div>

    </footer>
  );
}