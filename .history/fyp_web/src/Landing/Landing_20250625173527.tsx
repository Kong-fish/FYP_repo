import { Shield, CreditCard, Smartphone, TrendingUp, Users, Lock, CheckCircle, Star, Menu, Phone } from "lucide-react"

import "../Login/Cus_Landing.css"



export default function BankLandingPage() {

    return (

        <div className="container">

            {/* Header */}

            <header className="header">

                <div className="headerContainer">

                    <div className="headerContent">

                        <div className="logo">

                            <div className="logoIcon">

                                <CreditCard className="w-5 h-5 text-white" />

                            </div>

                            <span className="logoText">SecureBank</span>

                        </div>



                        <nav className="nav">

                            <a href="#" className="navLink">

                                Personal

                            </a>

                            <a href="#" className="navLink">

                                Business

                            </a>

                            <a href="#" className="navLink">

                                Loans

                            </a>

                            <a href="#" className="navLink">

                                Investments

                            </a>

                            <a href="#" className="navLink">

                                Support

                            </a>

                        </nav>



                        <div className="headerButtons">

                            <button className="signInButton">Sign In</button>

                            <button className="openAccountButton">Open Account</button>

                        </div>



                        <div className="mobileMenu">

                            <button className="menuButton">

                                <Menu className="w-6 h-6" />

                            </button>

                        </div>

                    </div>

                </div>

            </header>



            {/* Hero Section */}

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

                                    src="/placeholder.svg?height=400&width=500"

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



            {/* Features Section */}

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



            {/* Services Section */}

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

                                src="/placeholder.svg?height=500&width=600"

                                alt="Banking Services"

                                width={600}

                                height={500}

                                className="servicesImage"

                            />

                        </div>

                    </div>

                </div>

            </section>



            {/* Testimonials */}

            <section className="testimonials">

                <div className="testimonialsContainer">

                    <div className="sectionHeader">

                        <h2 className="sectionTitle">What Our Customers Say</h2>

                        <p className="sectionDescription">Join thousands of satisfied customers who trust SecureBank</p>

                    </div>



                    <div className="testimonialsGrid">

                        <div className="testimonialCard">

                            <div className="stars">

                                {[...Array(5)].map((_, i) => (

                                    <Star key={i} className="star" />

                                ))}

                            </div>

                            <p className="testimonialText">

                                "SecureBank has transformed how I manage my finances. The mobile app is intuitive and the customer

                                service is exceptional."

                            </p>

                            <div className="testimonialAuthor">

                                <div className="authorAvatar">JS</div>

                                <div className="authorInfo">

                                    <div className="authorName">John Smith</div>

                                    <div className="authorTitle">Small Business Owner</div>

                                </div>

                            </div>

                        </div>



                        <div className="testimonialCard">

                            <div className="stars">

                                {[...Array(5)].map((_, i) => (

                                    <Star key={i} className="star" />

                                ))}

                            </div>

                            <p className="testimonialText">

                                "The investment advice I received helped me grow my portfolio by 25% last year. Highly recommend their

                                wealth management services."

                            </p>

                            <div className="testimonialAuthor">

                                <div className="authorAvatar">MJ</div>

                                <div className="authorInfo">

                                    <div className="authorName">Maria Johnson</div>

                                    <div className="authorTitle">Investor</div>

                                </div>

                            </div>

                        </div>



                        <div className="testimonialCard">

                            <div className="stars">

                                {[...Array(5)].map((_, i) => (

                                    <Star key={i} className="star" />

                                ))}

                            </div>

                            <p className="testimonialText">

                                "Switching to SecureBank was the best financial decision I made. No fees, great rates, and amazing

                                digital experience."

                            </p>

                            <div className="testimonialAuthor">

                                <div className="authorAvatar">DW</div>

                                <div className="authorInfo">

                                    <div className="authorName">David Wilson</div>

                                    <div className="authorTitle">Engineer</div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>



            {/* CTA Section */}

            <section className="cta">

                <div className="ctaContainer">

                    <h2 className="ctaTitle">Ready to Start Your Financial Journey?</h2>

                    <p className="ctaDescription">Open your account today and experience the future of banking</p>



                    <div className="ctaForm">

                        <input type="email" placeholder="Enter your email address" className="ctaInput" />

                        <button className="ctaButton">Get Started</button>

                    </div>



                    <p className="ctaDisclaimer">No minimum deposit required. FDIC insured up to $250,000.</p>

                </div>

            </section>



            {/* Footer */}

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

        </div>

    )

}