
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

export default function Dashboard() {

  console.log('DASHBOARD COMPONENT IS RENDERING');

  return (
    <div className="dashboard-home">

      {/* =====================================================
          DIGITAL TWIN HERO
      ===================================================== */}

      <section className="digital-twin-section">

        {/* Spline FIRST */}
        <div className="spline-container">
          <Spline
            scene="https://prod.spline.design/a7pxykqwfmeBIE3M/scene.splinecode"
          />
        </div>


        {/* Hero content SECOND */}
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
            Explore the Antarctic station through an interactive
            digital twin with environmental and operational
            intelligence.
          </p>


          <div className="hero-buttons">

            <Link
              to="/view"
              className="hero-button primary"
            >
              View Station Details
              <span>→</span>
            </Link>


            <Link
              to="/environment"
              className="hero-button secondary"
            >
              View Environment Data
              <span>→</span>
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          DASHBOARD MODULES
      ===================================================== */}

      <section className="dashboard-content">

        <div className="section-heading">

          <div>
            <span className="section-tag">
              STATION INTELLIGENCE
            </span>

            <h2>
              Monitoring Modules
            </h2>
          </div>

          <span className="live-indicator">
            ● LIVE DATA
          </span>

        </div>


        <div className="dashboard-module-grid">


          {/* DIGITAL TWIN */}

          <Link
            to="/view"
            className="dashboard-module-card"
          >

            <div className="module-card-content">

              <span className="module-card-label">
                DIGITAL TWIN
              </span>

              <strong>
                Station Overview
              </strong>

              <p>
                Explore the digital representation of the
                Antarctic research station and its components.
              </p>

            </div>

            <span className="module-card-action">
              View Station Details →
            </span>

          </Link>


          {/* ENVIRONMENT */}

          <Link
            to="/environment"
            className="dashboard-module-card"
          >

            <div className="module-card-content">

              <span className="module-card-label">
                ENVIRONMENT
              </span>

              <strong>
                Environmental Monitoring
              </strong>

              <p>
                Monitor temperature, wind speed, humidity,
                ice thickness and visibility.
              </p>

            </div>

            <span className="module-card-action">
              View Environment Details →
            </span>

          </Link>


          {/* ENERGY */}

          <Link
            to="/energy"
            className="dashboard-module-card"
          >

            <div className="module-card-content">

              <span className="module-card-label">
                ENERGY
              </span>

              <strong>
                Energy Management
              </strong>

              <p>
                Monitor solar, wind and diesel generation,
                consumption and battery reserve.
              </p>

            </div>

            <span className="module-card-action">
              View Energy Details →
            </span>

          </Link>


          {/* INFRASTRUCTURE */}

          <Link
            to="/infrastructure"
            className="dashboard-module-card"
          >

            <div className="module-card-content">

              <span className="module-card-label">
                INFRASTRUCTURE
              </span>

              <strong>
                Infrastructure Monitoring
              </strong>

              <p>
                Inspect station facilities, structural health,
                equipment status and inspections.
              </p>

            </div>

            <span className="module-card-action">
              View Infrastructure Details →
            </span>

          </Link>


          {/* LOGISTICS */}

          <Link
            to="/logistics"
            className="dashboard-module-card"
          >

            <div className="module-card-content">

              <span className="module-card-label">
                LOGISTICS
              </span>

              <strong>
                Supply Management
              </strong>

              <p>
                Track food, fuel, medical supplies and
                critical station inventory.
              </p>

            </div>

            <span className="module-card-action">
              View Logistics Details →
            </span>

          </Link>


          {/* ALERTS */}

          <Link
            to="/alerts"
            className="dashboard-module-card"
          >

            <div className="module-card-content">

              <span className="module-card-label">
                ALERT CENTRE
              </span>

              <strong>
                Station Alerts
              </strong>

              <p>
                Review active warnings, operational events
                and critical station notifications.
              </p>

            </div>

            <span className="module-card-action">
              View Active Alerts →
            </span>

          </Link>

        </div>

      </section>

    </div>
  );
}

