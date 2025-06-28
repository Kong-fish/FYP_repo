import { Link } from "react-router-dom";
import { Shield, Smartphone, TrendingUp, Users, Lock, CheckCircle, Star, Menu, Phone, CreditCard } from "lucide-react";
import '../shared/normalize.css';

import "./Landing.css";

export default function CustomerLandingPage() {
  return (
    <>
      <Header />

      <div className="app" style={{ display: 'none' }}>
        <div className="customerLanding"></div> {/* This inner div was empty */}
      </div>

      <section className="hero">
        <div className="heroContainer">
          {/* Made hero section vertical with image above text */}
          <div className="heroGrid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            

            <div className="heroContent" style={{ marginTop: '20px' }}> {/* Added margin for spacing */}
              <div className="heroText">

                <h1 className="heroTitle">
                  Banking Made
                  <div className="heroTitleAccent">Simple & Secure</div>
                </h1>
                <p className="heroDescription">
                  Experience modern banking with AI.
                </p>
              </div>

              <div className="heroButtons">
                {/* Buttons remain larger */}
                <Link to="/login" className="signInButton" style={{ fontSize: '1.5rem', padding: '15px 30px' }}>
                  Login
                </Link>
                <Link to="/register" className="openAccountButton" style={{ fontSize: '1.5rem', padding: '15px 30px' }}>
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <Smartphone className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">Any Device</h3>
              <p className="featureDescription">Manage your finances anywhere with our web app. All within your browser.</p>
            </div>

            <div className="featureCard">
              <div className="featureIcon">
                <TrendingUp className="w-6 h-6 text-[#385a93]" />
              </div>
              <h3 className="featureTitle">Automated Loan Application</h3>
              <p className="featureDescription">Quick and automated loan application process where .</p>
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
    </>
  );
}