import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import '../shared/normalize.css';
import '../shared/additional.css';
import '../Login/Login.css';
import { useTranslation, Trans } from 'react-i18next';

const lngs = {

    en: { nativeName: 'English' },

    de: { nativeName: 'Deutsch' }

};



function Landing() {

    const { t, i18n } = useTranslation();



    return (

        <div className="app">

            <div className="login-page">

                <div className="form-login">

                    <div className="form-login__inner">

                        <h1>Welcome!</h1>



                        {/* Language switcher */}

                        <div>

                            {Object.keys(lngs).map((lng) => (

                                <button

                                    key={lng}

                                    style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }}

                                    type="button"

                                    onClick={() => i18n.changeLanguage(lng)}

                                >

                                    {lngs[lng].nativeName}

                                </button>

                            ))}

                        </div>



                        {/* Translated text */}

                        <p>

                            <Trans i18nKey="description.part1">

                                Edit <code>src/App.js</code> and save to reload.

                            </Trans>

                        </p>



                        <div className="form-login__form">

                            <Link to="/admin-login" className="form-login__button button button--yellow">

                                Admin Login

                            </Link>

                            <Link to="/customer-login" className="form-login__button button button--yellow">

                                Customer Login

                            </Link>

                            <Link to="/register" className="form-login__button button button--yellow">

                                Customer Register

                            </Link>

                            <Link to="/userinput" className="form-login__button button button--yellow">

                                Ensemble

                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}



export default Landing;

