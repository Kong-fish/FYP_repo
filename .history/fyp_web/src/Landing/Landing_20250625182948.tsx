import { Link } from "react-router-dom";
import { Shield, Smartphone, TrendingUp, Users, Lock, CheckCircle, Star, Menu, Phone, CreditCard } from "lucide-react";
import '../shared/normalize.css';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';
import "./Landing.css";

const Header = () => (
  <header className="header">
    <div className="header__content">
      <div className="logo">
        <span className="logoText header__title">Eminent Western</span>
      </div>
      <DarkModeToggle />
      <div className="headerButtons">
        <Link to="/customer-login" className="signInButton">
          Login
        </Link>
        <Link to="/customer-register" className="openAccountButton">
          Register
        </Link>
      </div>
    </div>
  </header>
);

export default function CustomerLandingPage() {
  return (
    <>
      {/* -----------------------------------------------------------------
          1. Render the Header Component
          This is the only visible part of the landing page as per the requirement.
          ----------------------------------------------------------------- */}
      <Header />

      {/* -----------------------------------------------------------------
          2. Original 'app' div (Hidden)
          This div was present in your initial Cus_Landing.tsx.
          It's explicitly hidden here to ensure no unwanted initial content appears.
          ----------------------------------------------------------------- */}
      <div className="app" style={{ display: 'none' }}>
        <div className="customerLanding"></div> {/* This inner div was empty */}
      </div>

      {/* -----------------------------------------------------------------
          3. Hero Section (UNCOMMENTED)
          This block contains the main introductory content with title, description,
          buttons, statistics, and an image. It is now UNCOMMENTED and will render.
          ----------------------------------------------------------------- */}
      <section className="hero">
        <div className="heroContainer">
          <div className="heroGrid">
            <div className="heroContent">
              <div className="heroText">
                <div className="badge">Trusted by 2M+ customers</div>
                <h1 className="heroTitle">
                  Banking Made
                  <span className="heroTitleAccent">Simple & Secure</span>
                </h1>
                <p className="heroDescription">
                  Experience modern banking with industry-leading security, competitive rates, and 24/7 support. Your
                  financial future starts here.
                </p>
              </div>

              <div className="heroButtons">
                <button className="primaryButton">Open Free Account</button>
                <button className="secondaryButton">Learn More</button>
              </div>

              <div className="heroStats">
                <div className="statItem">
                  <div className="statNumber">2M+</div>
                  <div className="statLabel">Active Users</div>
                </div>
                <div className="statItem">
                  <div className="statNumber">$50B+</div>
                  <div className="statLabel">Assets Managed</div>
                </div>
                <div className="statItem">
                  <div className="statNumber">99.9%</div>
                  <div className="statLabel">Uptime</div>
                </div>
              </div>
            </div>

            <div className="heroImage">
              <div className="imageContainer">
                <img
                  src="/eminent-western_bank-logo.png"
                  alt="Banking Dashboard"
                  width={500}
                  height={400}
                  className="dashboardImage"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          4. Features Section (Commented Out)
          This section highlights the key features of the banking service.
          It's currently commented out and will not render.
          ----------------------------------------------------------------- */}
      {/*
      <section className="features">
        <div className="featuresContainer">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Why Choose SecureBank?</h2>
            <p className="sectionDescription">
              We combine cutting-edge technology with personalized service to deliver the best banking experience.
            </p>
          </div>

          <div className="featuresGrid">
            <div className="featureCard">
              <div className="featureIcon">
                <Shield className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">Bank-Level Security</h3>
              <p className="featureDescription">
                256-bit encryption and multi-factor authentication protect your money and data.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureIcon">
                <Smartphone className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">Mobile First</h3>
              <p className="featureDescription">Manage your finances anywhere with our award-winning mobile app.</p>
            </div>

            <div className="featureCard">
              <div className="featureIcon">
                <TrendingUp className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">Smart Investments</h3>
              <p className="featureDescription">Grow your wealth with our AI-powered investment recommendations.</p>
            </div>

            <div className="featureCard">
              <div className="featureIcon">
                <Users className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">24/7 Support</h3>
              <p className="featureDescription">
                Get help whenever you need it with our round-the-clock customer service.
              </p>
            </div>

            <div className="featureCard">
              <div className="featureIcon">
                <Lock className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">FDIC Insured</h3>
              <p className="featureDescription">Your deposits are protected up to $250,000 by FDIC insurance.</p>
            </div>

            <div className="featureCard">
              <div className="featureIcon">
                <CheckCircle className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">No Hidden Fees</h3>
              <p className="featureDescription">Transparent pricing with no surprise charges or hidden fees.</p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* -----------------------------------------------------------------
          5. Services Section (Commented Out)
          This section details the various banking services offered.
          It's currently commented out and will not render.
          ----------------------------------------------------------------- */}
      {/*
      <section className="services">
        <div className="servicesContainer">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Complete Banking Solutions</h2>
            <p className="sectionDescription">Everything you need to manage your finances in one place</p>
          </div>

          <div className="servicesGrid">
            <div className="servicesList">
              <div className="serviceItem">
                <div className="serviceIcon">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="serviceTitle">Personal Banking</h3>
                  <p className="serviceDescription">
                    Checking, savings, and money market accounts with competitive rates.
                  </p>
                </div>
              </div>

              <div className="serviceItem">
                <div className="serviceIcon">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="serviceTitle">Credit Cards</h3>
                  <p className="serviceDescription">
                    Reward cards with cashback, travel points, and low interest rates.
                  </p>
                </div>
              </div>

              <div className="serviceItem">
                <div className="serviceIcon">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="serviceTitle">Loans & Mortgages</h3>
                  <p className="serviceDescription">Home loans, auto loans, and personal loans with flexible terms.</p>
                </div>
              </div>

              <div className="serviceItem">
                <div className="serviceIcon">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="serviceTitle">Investment Services</h3>
                  <p className="serviceDescription">
                    Portfolio management, retirement planning, and wealth advisory services.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <img
                src="/eminent-western_bank-logo.png"
                alt="Banking Services"
                width={600}
                height={500}
                className="servicesImage"
              />
            </div>
          </div>
        </div>
      </section>
      */}

      {/* -----------------------------------------------------------------
          6. Testimonials Section (REMOVED)
          This section previously displayed customer reviews. It has been removed.
          ----------------------------------------------------------------- */}

      {/* -----------------------------------------------------------------
          7. CTA Section (Call to Action) (REMOVED)
          This section previously prompted users to open an account. It has been removed.
          ----------------------------------------------------------------- */}

      {/* -----------------------------------------------------------------
          8. Footer (Commented Out)
          This is the footer section with navigation, contact, and copyright info.
          It's currently commented out and will not render.
          ----------------------------------------------------------------- */}
      {/*
      <footer className="footer">
        <div className="footerContainer">
          <div className="footerGrid">
            <div className="footerBrand">
              <div className="footerLogo">
                <div className="footerLogoIcon">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="footerLogoText">SecureBank</span>
              </div>
              <p className="footerDescription">Your trusted partner for secure and innovative banking solutions.</p>
              <div className="footerContact">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">1-800-SECURE</span>
              </div>
            </div>

            <div className="footerSection">
              <h3>Products</h3>
              <div className="footerLinks">
                <a href="#" className="footerLink">
                  Checking Accounts
                </a>
                <a href="#" className="footerLink">
                  Savings Accounts
                </a>
                <a href="#" className="footerLink">
                  Credit Cards
                </a>
                <a href="#" className="footerLink">
                  Loans
                </a>
              </div>
            </div>

            <div className="footerSection">
              <h3>Support</h3>
              <div className="footerLinks">
                <a href="#" className="footerLink">
                  Help Center
                </a>
                <a href="#" className="footerLink">
                  Contact Us
                </a>
                <a href="#" className="footerLink">
                  Security
                </a>
                <a href="#" className="footerLink">
                  Privacy Policy
                </a>
              </div>
            </div>

            <div className="footerSection">
              <h3>Company</h3>
              <div className="footerLinks">
                <a href="#" className="footerLink">
                  About Us
                </a>
                <a href="#" className="footerLink">
                  Careers
                </a>
                <a href="#" className="footerLink">
                  Press
                </a>
                <a href="#" className="footerLink">
                  Investors
                </a>
              </div>
            </div>
          </div>

          <div className="footerBottom">
            <p className="footerCopyright">© 2024 SecureBank. All rights reserved. Member FDIC.</p>
            <div className="footerBottomLinks">
              <a href="#" className="footerBottomLink">
                Terms
              </a>
              <a href="#" className="footerBottomLink">
                Privacy
              </a>
              <a href="#" className="footerBottomLink">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
      */}
    </>
  );
}