import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle, X } from 'lucide-react';

// --- Inlined CSS for AdminFunction.css (Comprehensive Styles) ---
// This CSS combines all the styles you provided, including variables and responsive adjustments.
const inlinedAdminCss = `
/* Root variables for light mode (default) - GLOBAL */
:root {
    --admin-smt-bg-color-light: #f4f6f9;
    --admin-smt-text-color-light: #333;
    --admin-smt-card-bg-light: #ffffff;
    --admin-smt-border-color-light: #e0e0e0;
    --admin-smt-primary-color-light: #4f8af5;
    --admin-smt-primary-hover-light: #3a75e3;
    --admin-smt-badge-success-bg-light: #d1fae5;
    --admin-smt-badge-success-text-light: #065f46;
    --admin-smt-badge-warning-bg-light: #fffbeb;
    --admin-smt-badge-warning-text-light: #b45309;
    --admin-smt-badge-error-bg-light: #fee2e2;
    --admin-smt-badge-error-text-light: #991b1b;
    --admin-smt-header-bg-light: #5a7edc;
    --admin-smt-header-text-light: #ffffff;
    --admin-smt-input-bg-light: #ffffff;
    --admin-smt-input-border-light: #ccc;
    --admin-smt-icon-color-light: #666;
    --admin-smt-table-header-bg-light: #f0f2f5;
    --admin-smt-table-border-light: #e0e0e0;
    --admin-smt-hover-bg-light: #f9f9f9;
    --admin-smt-active-tab-border-light: #4f8af5;

    /* LoanApplicationView specific variables (light mode) */
    --lav-text-color-heading: var(--admin-smt-text-color-light);
    --lav-shadow-small: 0 2px 5px rgba(0, 0, 0, 0.1);
    --lav-shadow-large: 0 5px 15px rgba(0, 0, 0, 0.2);
    --lav-primary-button-bg: var(--admin-smt-primary-color-light);
    --lav-primary-button-text: #ffffff;
    --lav-primary-button-hover-bg: var(--admin-smt-primary-hover-light);
    --lav-color-error: var(--admin-smt-badge-error-bg-light);
    --lav-code-bg-color: #f5f5f5;
    --lav-code-text-color: #333333;

    /* Prediction Modal Variables (light mode) */
    --modal-bg-color: var(--admin-smt-card-bg-light);
    --modal-text-color: var(--admin-smt-text-color-light);
    --modal-shadow: var(--lav-shadow-large);
    --modal-border-color: var(--admin-smt-border-color-light);
    --modal-close-btn-color: #666;
    --modal-close-btn-hover-color: #000;
    --loader-color: var(--admin-smt-primary-color-light);
    --section-bg-color: var(--admin-smt-bg-color-light);
    --section-border-color: var(--admin-smt-border-color-light);
    --risk-color: var(--admin-smt-badge-error-text-light);
    --no-risk-color: var(--admin-smt-badge-success-text-light);
    --probability-color: var(--admin-smt-primary-color-light);
    --feature-list-bg: #f2f2f2;
    --feature-item-border: #e9e9e9;
    --approve-btn-bg-modal: #28a745;
    --approve-btn-hover-bg-modal: #218838;
    --reject-btn-bg-modal: #dc3545;
    --reject-btn-hover-bg-modal: #c82333;
    --disabled-btn-bg: #cccccc;
    --disabled-btn-text: #666666;
    --status-message-color: #4a5568;
}

/* Dark mode variables - GLOBAL (targeting html.dark) */
html.dark {
    --admin-smt-bg-color-dark: #1a202c;
    --admin-smt-text-color-dark: #e2e8f0;
    --admin-smt-card-bg-dark: #2d3748;
    --admin-smt-border-color-dark: #4a5568;
    --admin-smt-primary-color-dark: #63b3ed;
    --admin-smt-primary-hover-dark: #4299e1;
    --admin-smt-badge-success-bg-dark: #2f855a;
    --admin-smt-badge-success-text-dark: #e6fffa;
    --admin-smt-badge-warning-bg-dark: #d69e2e;
    --admin-smt-badge-warning-text-dark: #fefcbf;
    --admin-smt-badge-error-bg-dark: #c53030;
    --admin-smt-badge-error-text-dark: #fed7d7;
    --admin-smt-header-bg-dark: #2d3748;
    --admin-smt-header-text-dark: #e2e8f0;
    --admin-smt-input-bg-dark: #4a5568;
    --admin-smt-input-border-dark: #666;
    --admin-smt-icon-color-dark: #cbd5e0;
    --admin-smt-table-header-bg-dark: #4a5568;
    --admin-smt-table-border-dark: #666;
    --admin-smt-hover-bg-dark: #4a5568;
    --admin-smt-active-tab-border-dark: #63b3ed;

    /* LoanApplicationView specific variables (dark mode) */
    --lav-text-color-heading: var(--admin-smt-text-color-dark);
    --lav-shadow-small: 0 2px 5px rgba(0, 0, 0, 0.4);
    --lav-shadow-large: 0 5px 15px rgba(0, 0, 0, 0.6);
    --lav-primary-button-bg: var(--admin-smt-primary-color-dark);
    --lav-primary-button-text: #ffffff;
    --lav-primary-button-hover-bg: var(--admin-smt-primary-hover-dark);
    --lav-color-error: var(--admin-smt-badge-error-bg-dark);
    --lav-code-bg-color: #1e1e1e;
    --lav-code-text-color: #d4d4d4;

    /* Prediction Modal Variables (dark mode) */
    --modal-bg-color: var(--admin-smt-card-bg-dark);
    --modal-text-color: var(--admin-smt-text-color-dark);
    --modal-shadow: var(--lav-shadow-large);
    --modal-border-color: var(--admin-smt-border-color-dark);
    --modal-close-btn-color: #aaaaaa;
    --modal-close-btn-hover-color: #ffffff;
    --loader-color: var(--admin-smt-primary-color-dark);
    --section-bg-color: var(--admin-smt-bg-color-dark);
    --section-border-color: var(--admin-smt-border-color-dark);
    --risk-color: var(--admin-smt-badge-error-text-dark);
    --no-risk-color: var(--admin-smt-badge-success-text-dark);
    --probability-color: var(--admin-smt-primary-color-dark);
    --feature-list-bg: #4a4a4a;
    --feature-item-border: #555555;
    --approve-btn-bg-modal: #2f855a;
    --approve-btn-hover-bg-modal: #22543d;
    --reject-btn-bg-modal: #c53030;
    --reject-btn-hover-bg-modal: #9b2c2c;
    --disabled-btn-bg: #555555;
    --disabled-btn-text: #aaaaaa;
    --status-message-color: #a0aec0;
}


/* General Body Styles - these will inherit from :root or html.dark */
body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
    background-color: var(--admin-smt-bg-color-light); /* Use light mode variable by default */
    color: var(--admin-smt-text-color-light); /* Use light mode variable by default */
    transition: background-color 0.3s ease, color 0.3s ease; /* Smooth transition */
    min-height: 100vh; /* Ensure body takes full viewport height */
    display: flex; /* Use flex to allow main content to grow */
    flex-direction: column;
}

/* Apply dark mode variables when 'dark' class is active on html */
html.dark body {
    background-color: var(--admin-smt-bg-color-dark);
    color: var(--admin-smt-text-color-dark);
}

/* Admin Container */
.admin-smt-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    flex-grow: 1; /* Allow container to grow within body */
}

/* Main Content Area (for admin dashboard) */
.admin-smt-main-content {
    flex-grow: 1;
    padding: 20px;
    background-color: var(--admin-smt-bg-color-light);
    color: var(--admin-smt-text-color-light);
    transition: background-color 0.3s ease, color 0.3s ease;
}

html.dark .admin-smt-main-content {
    background-color: var(--admin-smt-bg-color-dark);
    color: var(--admin-smt-text-color-dark);
}

.admin-smt-brand-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.admin-smt-brand-logo {
    width: 40px;
    height: 40px;
    background-color: var(--admin-smt-primary-color-light);
    border-radius: 8px;
}

html.dark .admin-smt-brand-logo {
    background-color: var(--admin-smt-primary-color-dark);
}

.admin-smt-brand-title {
    margin: 0;
    font-size: 1.8em;
    font-weight: 700;
    color: var(--admin-smt-header-text-light);
}

html.dark .admin-smt-brand-title {
    color: var(--admin-smt-header-text-dark);
}

.admin-smt-search-container {
    position: relative;
    flex-grow: 0;
    max-width: 300px;
    width: 100%;
}

.admin-smt-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--admin-smt-icon-color-light);
}

html.dark .admin-smt-search-icon {
    color: var(--admin-smt-icon-color-dark);
}

.admin-smt-search-input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border: 1px solid var(--admin-smt-input-border-light);
    border-radius: 6px;
    background-color: var(--admin-smt-input-bg-light);
    color: var(--admin-smt-text-color-light);
    font-size: 1em;
    transition: all 0.3s ease;
}

html.dark .admin-smt-search-input {
    border-color: var(--admin-smt-input-border-dark);
    background-color: var(--admin-smt-input-bg-dark);
    color: var(--admin-smt-text-color-dark);
}

.admin-smt-search-input:focus {
    outline: none;
    border-color: var(--admin-smt-primary-color-light);
    box-shadow: 0 0 0 2px rgba(79, 138, 245, 0.2);
}

html.dark .admin-smt-search-input:focus {
    border-color: var(--admin-smt-primary-color-dark);
    box-shadow: 0 0 0 2px rgba(99, 179, 237, 0.2);
}

/* Stats Grid */
.admin-smt-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

/* Card Styles */
.admin-smt-card {
    background-color: var(--admin-smt-card-bg-light);
    border: 1px solid var(--admin-smt-border-color-light);
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

html.dark .admin-smt-card {
    background-color: var(--admin-smt-card-bg-dark);
    border-color: var(--admin-smt-border-color-dark);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.admin-smt-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.admin-smt-card-title {
    margin: 0;
    font-size: 1.2em;
    font-weight: 600;
    color: var(--admin-smt-text-color-light);
}

html.dark .admin-smt-card-title {
    color: var(--admin-smt-text-color-dark);
}

.admin-smt-stat-icon {
    color: var(--admin-smt-primary-color-light);
    font-size: 1.5em;
}

html.dark .admin-smt-stat-icon {
    color: var(--admin-smt-primary-color-dark);
}

.admin-smt-stat-number {
    font-size: 2.5em;
    font-weight: 700;
    margin-bottom: 5px;
    color: var(--admin-smt-text-color-light);
}

html.dark .admin-smt-stat-number {
    color: var(--admin-smt-text-color-dark);
}

.admin-smt-stat-description {
    font-size: 0.9em;
    color: #777;
}

html.dark .admin-smt-stat-description {
    color: #a0aec0;
}

/* Tabs */
.admin-smt-tabs-container {
    margin-bottom: 20px;
}

.admin-smt-tabs-list {
    display: flex;
    width: 100%;
    border-bottom: 1px solid var(--admin-smt-border-color-light);
    margin-bottom: 20px;
    justify-content: flex-start;
    flex-wrap: nowrap;
    transition: border-color 0.3s ease;
}

html.dark .admin-smt-tabs-list {
    border-color: var(--admin-smt-border-color-dark);
}

.admin-smt-tab-trigger {
    padding: 12px 20px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    color: #888;
    border-bottom: 2px solid transparent;
    transition: color 0.3s ease, border-bottom-color 0.3s ease;
}

html.dark .admin-smt-tab-trigger {
    color: #a0aec0;
}

.admin-smt-tab-trigger:hover {
    color: var(--admin-smt-primary-color-light);
}

html.dark .admin-smt-tab-trigger:hover {
    color: var(--admin-smt-primary-color-dark);
}

.admin-smt-tab-trigger.active {
    color: var(--admin-smt-primary-color-light);
    border-bottom-color: var(--admin-smt-primary-color-light);
    font-weight: 600;
}

html.dark .admin-smt-tab-trigger.active {
    border-bottom-color: var(--admin-smt-primary-color-dark);
}

.admin-smt-tab-content {
    width: 100%;
}

/* Table Styles */
.admin-smt-table-container {
    overflow-x: auto;
    border: 1px solid var(--admin-smt-border-color-light);
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    background-color: var(--admin-smt-card-bg-light);
    transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

html.dark .admin-smt-table-container {
    border-color: var(--admin-smt-border-color-dark);
    background-color: var(--admin-smt-card-bg-dark);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.admin-smt-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.admin-smt-table-header {
    background-color: var(--admin-smt-table-header-bg-light);
    border-bottom: 1px solid var(--admin-smt-border-color-light);
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

html.dark .admin-smt-table-header {
    background-color: var(--admin-smt-table-header-bg-dark);
    border-color: var(--admin-smt-border-color-dark);
}

.admin-smt-table-head {
    padding: 15px 20px;
    text-align: left;
    font-weight: 600;
    font-size: 0.9em;
    color: #555;
    text-transform: uppercase;
}

html.dark .admin-smt-table-head {
    color: #cbd5e0;
}

.admin-smt-table-body .admin-smt-table-row:nth-child(even) {
    background-color: var(--admin-smt-hover-bg-light);
}

html.dark .admin-smt-table-body .admin-smt-table-row:nth-child(even) {
    background-color: var(--admin-smt-hover-bg-dark);
}

.admin-smt-table-row:hover {
    background-color: var(--admin-smt-hover-bg-light);
}

html.dark .admin-smt-table-row:hover {
    background-color: var(--admin-smt-hover-bg-dark);
}

.admin-smt-table-cell {
    padding: 15px 20px;
    border-bottom: 1px solid var(--admin-smt-border-color-light);
    color: var(--admin-smt-text-color-light);
    transition: border-color 0.3s ease, color 0.3s ease;
}

html.dark .admin-smt-table-cell {
    border-color: var(--admin-smt-border-color-dark);
    color: var(--admin-smt-text-color-dark);
}

.admin-smt-table-cell-bold {
    font-weight: 500;
}

/* Badges (Status Indicators) */
.admin-smt-badge {
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.8em;
    font-weight: 600;
    text-transform: capitalize;
}

.admin-smt-badge-success {
    background-color: var(--admin-smt-badge-success-bg-light);
    color: var(--admin-smt-badge-success-text-light);
}

html.dark .admin-smt-badge-success {
    background-color: var(--admin-smt-badge-success-bg-dark);
    color: var(--admin-smt-badge-success-text-dark);
}

.admin-smt-badge-warning {
    background-color: var(--admin-smt-badge-warning-bg-light);
    color: var(--admin-smt-badge-warning-text-light);
}

html.dark .admin-smt-badge-warning {
    background-color: var(--admin-smt-badge-warning-bg-dark);
    color: var(--admin-smt-badge-warning-text-dark);
}

.admin-smt-badge-error {
    background-color: var(--admin-smt-badge-error-bg-light);
    color: var(--admin-smt-badge-error-text-light);
}

html.dark .admin-smt-badge-error {
    background-color: var(--admin-smt-badge-error-bg-dark);
    color: var(--admin-smt-badge-error-text-dark);
}

.admin-smt-badge-default {
    background-color: #e0e0e0;
    color: #555;
}

html.dark .admin-smt-badge-default {
    background-color: #666;
    color: #e0e0e0;
}

/* Buttons */
.admin-smt-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

.admin-smt-btn-primary {
    background-color: var(--admin-smt-primary-color-light);
    color: #ffffff;
}

html.dark .admin-smt-btn-primary {
    background-color: var(--admin-smt-primary-color-dark);
    color: var(--admin-smt-text-color-dark);
}

.admin-smt-btn-primary:hover {
    background-color: var(--admin-smt-primary-hover-light);
    transform: translateY(-1px);
}

html.dark .admin-smt-btn-primary:hover {
    background-color: var(--admin-smt-primary-hover-dark);
}

.admin-smt-btn-ghost {
    background-color: transparent;
    color: var(--admin-smt-primary-color-light);
    padding: 5px 10px;
}

html.dark .admin-smt-btn-ghost {
    color: var(--admin-smt-primary-color-dark);
}

.admin-smt-btn-ghost:hover {
    background-color: rgba(79, 138, 245, 0.1);
}

html.dark .admin-smt-btn-ghost:hover {
    background-color: rgba(99, 179, 237, 0.1);
}

.admin-smt-action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: none;
    color: #666;
}

html.dark .admin-smt-action-button {
    color: #cbd5e0;
}

.admin-smt-action-button:hover {
    background-color: var(--admin-smt-hover-bg-light);
    color: var(--admin-smt-primary-color-light);
}

html.dark .admin-smt-action-button:hover {
    background-color: var(--admin-smt-hover-bg-dark);
    color: var(--admin-smt-primary-color-dark);
}

.admin-smt-action-icon {
    width: 18px;
    height: 18px;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

.admin-smt-sign-out-button {
    background-color: #ef4444;
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.admin-smt-sign-out-button:hover {
    background-color: #dc2626;
}

/* ========================================================= */
/* LoanApplicationView specific styles */
/* ========================================================= */

/* Base container styling for the entire page */
.loan-view-container {
    padding: 20px;
    max-width: 1200px; /* Max width to keep content readable */
    width: 100%; /* Ensure it takes full available width */
    margin: 20px auto; /* Center the container with margin */
    background-color: var(--admin-smt-bg-color-light); /* Use admin-smt background */
    border-radius: 8px;
    box-shadow: var(--lav-shadow-small);
    color: var(--admin-smt-text-color-light); /* Use admin-smt text color */
    transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

/* Ensure full width and proper background for dark mode */
html.dark .loan-view-container {
    background-color: var(--admin-smt-bg-color-dark);
    color: var(--admin-smt-text-color-dark);
}


/* Styles for loading, error, and no data messages */
.loan-view-container.loading,
.loan-view-container.error-message,
.loan-view-container.no-data {
    text-align: center;
    padding: 50px;
    font-size: 1.1rem;
    color: var(--admin-smt-text-color-light);
}

html.dark .loan-view-container.loading,
html.dark .loan-view-container.error-message,
html.dark .loan-view-container.no-data {
    color: var(--admin-smt-text-color-dark);
}


.loan-view-container.error-message p {
    color: var(--admin-smt-badge-error-text-light);
}

html.dark .loan-view-container.error-message p {
    color: var(--admin-smt-badge-error-text-dark);
}

/* Page title (e.g., Loan Application Details) */
.loan-page-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--admin-smt-primary-color-light); /* Using admin-smt primary color */
    margin-bottom: 25px;
    text-align: center;
    border-bottom: 2px solid rgba(79, 138, 245, 0.2); /* Uses primary color for border */
    padding-bottom: 15px;
    transition: color 0.3s ease, border-bottom-color 0.3s ease;
}

html.dark .loan-page-title {
    color: var(--admin-smt-primary-color-dark);
    border-bottom-color: rgba(99, 102, 241, 0.3);
}

/* Main card displaying loan details, acts as a container for sections */
.loan-details-card {
    display: flex; /* Use flexbox to stack sections vertically */
    flex-direction: column;
    gap: 30px; /* Gap between major sections */
    padding: 20px;
    border: 1px solid var(--admin-smt-border-color-light);
    border-radius: 10px;
    background-color: var(--admin-smt-background-color); /* Matches page background to blend nicely */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

html.dark .loan-details-card {
    border-color: var(--admin-smt-border-color-dark);
    background-color: var(--admin-smt-card-bg-dark); /* Card bg from admin-smt */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* New section group styling (e.g., Personal Details, Loan Details) */
.loan-section-group {
    border: 1px solid var(--admin-smt-border-color-light);
    border-radius: 8px;
    padding: 20px;
    background-color: var(--admin-smt-card-bg-light); /* Use admin-smt card background */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

html.dark .loan-section-group {
    border-color: var(--admin-smt-border-color-dark);
    background-color: var(--admin-smt-card-bg-dark);
}

.loan-section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--admin-smt-text-color-light);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--admin-smt-border-color-light);
    transition: color 0.3s ease, border-bottom-color 0.3s ease;
}

html.dark .loan-section-title {
    color: var(--admin-smt-text-color-dark);
    border-bottom-color: var(--admin-smt-border-color-dark);
}

/* Grid for details within each section */
.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px 30px; /* Smaller gap between individual details */
}

.detail-group {
    display: flex;
    flex-direction: column;
    padding: 0; /* Remove vertical padding from here, controlled by gap in grid */
    border-bottom: none; /* Remove individual borders here */
}

.detail-label {
    font-weight: 600;
    color: var(--admin-smt-text-color-light);
    margin-bottom: 3px; /* Smaller margin below label */
    font-size: 0.9rem;
    transition: color 0.3s ease;
}

html.dark .detail-label {
    color: var(--admin-smt-text-color-dark);
}

.detail-value {
    font-size: 0.95rem; /* Slightly smaller font for tighter look */
    color: var(--admin-smt-text-color-light);
    word-wrap: break-word;
    transition: color 0.3s ease;
}

html.dark .detail-value {
    color: var(--admin-smt-text-color-dark);
}

/* Specific styling for AI Prediction section */
.ai-prediction-group {
    grid-column: 1 / -1; /* Spans full width of the grid */
    background-color: var(--lav-code-bg-color); /* Use LAV specific code bg */
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
    border: 1px solid var(--admin-smt-border-color-light);
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

html.dark .ai-prediction-group {
    background-color: var(--lav-code-bg-color); /* Use LAV specific code bg dark */
    border-color: var(--admin-smt-border-color-dark);
}

.ai-prediction-group pre {
    background-color: var(--lav-code-bg-color);
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 0.85rem;
    color: var(--lav-code-text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}

html.dark .ai-prediction-group pre {
    background-color: var(--lav-code-bg-color);
    color: var(--lav-code-text-color);
}

.view-prediction-button {
    background-color: var(--admin-smt-primary-color-light);
    color: var(--lav-primary-button-text);
    padding: 8px 15px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease, transform 0.1s ease;
    margin-top: 10px;
    align-self: flex-start;
}

.view-prediction-button:hover {
    background-color: var(--admin-smt-primary-hover-light);
    transform: translateY(-1px);
}

/* Status Badges - leveraging admin-smt badge variables directly */
.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.status-badge.approved {
    background-color: var(--admin-smt-badge-success-bg-light);
    color: var(--admin-smt-badge-success-text-light);
}

html.dark .status-badge.approved {
    background-color: var(--admin-smt-badge-success-bg-dark);
    color: var(--admin-smt-badge-success-text-dark);
}

.status-badge.rejected {
    background-color: var(--admin-smt-badge-error-bg-light);
    color: white; /* Keep white for visibility on dark red */
}

html.dark .status-badge.rejected {
    background-color: var(--admin-smt-badge-error-bg-dark);
    color: var(--admin-smt-badge-error-text-dark);
}

.status-badge.pending {
    background-color: var(--admin-smt-badge-warning-bg-light);
    color: var(--admin-smt-badge-warning-text-light);
}

html.dark .status-badge.pending {
    background-color: var(--admin-smt-badge-warning-bg-dark);
    color: var(--admin-smt-badge-warning-text-dark);
}

/* Action Buttons for Approve/Reject */
.action-buttons-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

.action-button {
    padding: 12px 25px;
    border-radius: 8px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.approve-button {
    background-color: var(--admin-smt-primary-color-light); /* Use primary for consistency */
    color: var(--lav-primary-button-text);
}

html.dark .approve-button {
    background-color: var(--admin-smt-primary-color-dark);
}

.approve-button:hover {
    background-color: var(--admin-smt-primary-hover-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

html.dark .approve-button:hover {
    background-color: var(--admin-smt-primary-hover-dark);
}

.reject-button {
    background-color: var(--admin-smt-badge-error-bg-light); /* Use error badge bg */
    color: white;
}

html.dark .reject-button {
    background-color: var(--admin-smt-badge-error-bg-dark);
}

.reject-button:hover {
    background-color: var(--admin-smt-badge-error-text-light); /* Darker error hover */
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

html.dark .reject-button:hover {
    background-color: var(--admin-smt-badge-error-text-dark);
}

.action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}


/* PredictionResult Modal Styling (referencing existing variables and adding specifics for modal) */
.prediction-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}

.prediction-modal-content {
    background-color: var(--modal-bg-color);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: var(--modal-shadow);
    width: 90%;
    max-width: 600px;
    max-height: 90vh; /* Limit height to 90% of viewport height */
    overflow-y: auto; /* Enable vertical scrolling if content overflows */
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeInScale 0.3s ease-out forwards;
    border: 1px solid var(--modal-border-color);
    color: var(--modal-text-color);
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.prediction-modal-close-btn {
    position: absolute; /* Changed to absolute for consistent positioning */
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    color: var(--modal-close-btn-color);
    transition: all 0.2s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

.prediction-modal-close-btn:hover {
    color: var(--modal-close-btn-hover-color);
    background-color: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
}

html.dark .prediction-modal-close-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.prediction-modal-title {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    color: var(--modal-text-color);
    border-bottom: 1px solid var(--modal-border-color);
    padding-bottom: 1rem;
    transition: color 0.3s ease, border-bottom-color 0.3s ease;
}

.prediction-loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    gap: 0.8rem;
    color: var(--modal-text-color);
}

.prediction-loader {
    animation: spin 1s linear infinite;
    color: var(--loader-color);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.prediction-loading-text {
    font-size: 1.1rem;
    color: var(--modal-text-color);
}

.prediction-main-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.prediction-result-section,
.prediction-feature-section {
    background-color: var(--section-bg-color);
    padding: 1.2rem;
    border-radius: 8px;
    border: 1px solid var(--section-border-color);
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.prediction-result-section {
    align-items: center;
    text-align: center;
}

.prediction-item {
    font-size: 1.1rem;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.prediction-label {
    font-weight: 500;
    color: var(--modal-text-color);
}

.prediction-value {
    font-weight: 700;
    padding: 0.3rem 0.6rem;
    border-radius: 5px;
}

.prediction-value.risk {
    color: var(--risk-color);
}

.prediction-value.no-risk {
    color: var(--no-risk-color);
}

.probability-value {
    color: var(--probability-color);
    font-weight: 700;
}

.prediction-section-subtitle {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--modal-text-color);
    margin-top: 0;
    margin-bottom: 1rem;
    text-align: center;
    border-bottom: 1px dashed var(--section-border-color);
    padding-bottom: 0.8rem;
    transition: color 0.3s ease, border-bottom-color 0.3s ease;
}

.feature-importances-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    background-color: var(--feature-list-bg);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--feature-item-border);
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.feature-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
    background-color: inherit; /* Inherit from list background */
    border-bottom: 1px solid var(--feature-item-border);
    font-size: 0.95rem;
}

.feature-item:last-child {
    border-bottom: none;
}

.feature-name {
    font-weight: 500;
    color: var(--modal-text-color);
}

.feature-percentage {
    font-weight: 600;
    color: var(--probability-color);
}

.no-prediction-data,
.no-feature-data {
    text-align: center;
    color: var(--modal-text-color);
    font-style: italic;
    padding: 1rem;
}

.prediction-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--modal-border-color);
    transition: border-top-color 0.3s ease;
}

.prediction-action-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
}

.prediction-action-btn:disabled {
    background-color: var(--disabled-btn-bg);
    color: var(--disabled-btn-text);
    cursor: not-allowed;
    transform: none;
}

.prediction-approve-btn {
    background-color: var(--approve-btn-bg-modal);
    color: white;
}

.prediction-approve-btn:not(:disabled):hover {
    background-color: var(--approve-btn-hover-bg-modal);
    transform: translateY(-2px);
}

.prediction-reject-btn {
    background-color: var(--reject-btn-bg-modal);
    color: white;
}

.prediction-reject-btn:not(:disabled):hover {
    background-color: var(--reject-btn-hover-bg-modal);
    transform: translateY(-2px);
}

.prediction-action-spinner {
    animation: spin 1s linear infinite;
}

.prediction-status-message {
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--status-message-color);
}

/* Responsive adjustments for modal */
@media (max-width: 768px) {
    .prediction-modal-content {
        padding: 1.5rem;
        width: 95%;
        max-height: 90vh;
    }

    .prediction-modal-title {
        font-size: 1.5rem;
    }

    .prediction-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .prediction-actions {
        flex-direction: column;
    }
}

/* ================== Responsive Design (Media Queries) ================== */

/* Tablet (medium screens: 768px to 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
    .admin-smt-stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    /* LoanApplicationView Responsive Adjustments */
    .loan-view-container {
        margin: 20px;
        padding: 20px;
    }

    .loan-page-title { /* Changed from .page-title */
        font-size: 1.8rem;
        padding-top: 0; /* Removed padding-top, as Header handles it */
    }

    /* Removed .back-button as it's part of Header */

    .loan-details-card {
        gap: 20px;
    }

    .detail-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px 20px;
    }

    .detail-label,
    .detail-value {
        font-size: 0.9rem;
    }

    .action-buttons-container {
        gap: 15px;
    }

    .action-button {
        padding: 10px 20px;
        font-size: 1rem;
    }

    /* Prediction Modal Responsive Adjustments */
    .prediction-modal-content {
        padding: 20px;
        width: 95%;
    }

    .prediction-modal-title {
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .prediction-result-section {
        padding: 15px;
    }

    .prediction-label,
    .prediction-value,
    .probability-value {
        font-size: 0.95rem;
    }

    .prediction-section-subtitle { /* Changed from .prediction-section-title */
        font-size: 1.1rem;
    }

    .feature-item {
        padding: 8px 10px;
        font-size: 0.9rem;
    }

    .prediction-actions {
        flex-direction: row;
        gap: 15px;
    }

    .prediction-action-btn {
        width: auto;
        padding: 10px;
        font-size: 0.95rem;
    }
}

/* Mobile (small screens: up to 767px) */
@media (max-width: 767px) {
    .admin-smt-main-content {
        padding: 15px;
    }

    .admin-smt-stats-grid {
        grid-template-columns: 1fr;
    }

    .admin-smt-card {
        padding: 20px;
    }

    .admin-smt-brand-title {
        font-size: 1.5em;
    }

    .admin-smt-search-input {
        padding: 10px 10px 10px 40px;
    }

    .admin-smt-search-icon {
        left: 10px;
    }

    .admin-smt-tabs-list {
        flex-direction: column;
        align-items: flex-start;
    }

    .admin-smt-tab-trigger {
        width: 100%;
        text-align: left;
        padding: 10px 15px;
        border-bottom: none;
    }

    html.dark .admin-smt-tab-trigger.active {
        border-bottom-color: var(--admin-smt-primary-color-dark);
    }

    .admin-smt-table {
        min-width: 600px;
    }

    .admin-smt-search-container {
        width: 100%;
        max-width: none;
    }

    .admin-smt-btn {
        width: 100%;
    }

    /* LoanApplicationView Responsive Adjustments */
    .loan-view-container {
        margin: 15px;
        padding: 15px;
    }

    .loan-page-title { /* Changed from .page-title */
        font-size: 1.5rem;
        padding-top: 0; /* Removed padding-top, as Header handles it */
    }

    .action-buttons-container {
        flex-direction: column;
        gap: 10px;
    }

    .action-button {
        width: 100%;
        font-size: 1rem;
        padding: 10px 20px;
    }

    /* Prediction Modal Responsive Adjustments */
    .prediction-actions {
        flex-direction: column;
        gap: 15px;
    }

    .prediction-action-btn {
        width: 100%;
        padding: 10px;
        font-size: 0.95rem;
    }
}
`;

// --- Placeholder for supabaseClient.js ---
const supabase = {
    auth: {
        signOut: async () => {
            console.log("Mock Supabase: Signing out...");
            await new Promise(resolve => setTimeout(resolve, 300));
            return { error: null };
        }
    },
    from: (tableName: string) => ({
        select: (columns: string) => ({
            eq: (column: string, value: any) => ({
                single: async () => {
                    console.log(`Mock Supabase: Fetching from ${tableName} where ${column} = ${value}`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return { data: null, error: { message: "Mock data fetching (Supabase not configured)" } };
                }
            }),
            order: () => ({
                limit: () => ({
                    select: async () => {
                        console.log("Mock Supabase: Fetching ordered data.");
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return { data: [], error: null };
                    }
                })
            })
        }),
        update: async (data: any) => ({
            eq: async (column: string, value: any) => {
                console.log(`Mock Supabase: Updating ${column}=${value} with`, data);
                await new Promise(resolve => setTimeout(resolve, 300));
                return { error: null };
            }
        })
    })
};

// --- Placeholder for DarkModeToggle.tsx ---
const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark'); // Apply to html element
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <label className="dark-mode-toggle">
            <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleDarkMode}
                className="dark-mode-checkbox"
            />
            <span className="dark-mode-slider"></span>
        </label>
    );
};


// --- Header component ---
const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/');
        }
    };

    const handleBack = () => {
        navigate("/admin-dashboard");
    };

    return (
        <header className="admin-header-main">
            <div className="admin-header-content">
                <button onClick={handleBack} className="admin-back-button">
                    <ArrowLeft size={20} />
                    <span className="admin-back-button-text">Back</span>
                </button>

                <div className="admin-logo-section">
                    <h1 className="admin-logo-text">Eminent Western</h1>
                </div>
                <nav className="admin-header-nav"></nav>
                <div className="admin-header-actions">
                    <DarkModeToggle />
                    <button onClick={handleSignOut} className="admin-sign-out-button">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};

// Interface definitions
interface LoanApplication {
    loan_id: number;
    customer_id: string;
    customer_annual_income: number | null;
    customer_job_company_name: string | null;
    customer_job_title: string | null;
    customer_job_years: number | null;
    customer_home_ownership: string | null;
    loan_intent: string | null;
    loan_grade: string | null;
    loan_interest_rate: number | null;
    customer_credit_score: number | null;
    customer_credit_history_years: number | null;
    customer_default: boolean | null;
    application_date: string;
    ai_prediction: {
        predicted_default: boolean;
        probability: number;
        top_features?: { feature: string; contribution: number; }[];
    } | null;
    final_approval: boolean | null;
    loan_amount: number | null;
    account_number: string | null;
    Customer: {
        first_name: string;
        last_name: string;
        username: string;
        phone_no: string;
    } | null;
}

interface AIPredictionResult {
    predicted_default: boolean;
    probability: number;
    top_features?: FeatureContribution[];
}

interface FeatureContribution {
    feature: string;
    contribution: number;
}

// Helper function for status classes (can be moved to a utility file if reused)
const getStatusClass = (status: boolean | null | string) => {
    if (typeof status === "boolean") {
        return status ? "status-approved" : "status-rejected";
    }
    switch (String(status).toLowerCase()) {
        case "active":
        case "approved":
            return "status-approved";
        case "pending":
        case "under review":
            return "status-pending";
        case "inactive":
        case "rejected":
        case "failed":
            return "status-rejected";
        default:
            return "status-pending";
    }
};


// PredictionResult Modal Component (defined below for self-containment)
interface PredictionResultProps {
    isOpen: boolean;
    onClose: () => void;
    predictionData: AIPredictionResult | null;
    isLoadingPrediction: boolean;
    onApprove: () => void;
    onReject: () => void;
    isUpdatingLoanStatus: boolean;
    loanApprovalStatus: boolean | null;
}

const PredictionResult: React.FC<PredictionResultProps> = ({
    isOpen,
    onClose,
    predictionData,
    isLoadingPrediction,
    onApprove,
    onReject,
    isUpdatingLoanStatus,
    loanApprovalStatus
}) => {
    if (!isOpen) return null;

    return (
        <div className="prediction-modal-overlay">
            <div className="prediction-modal-content animate-scale-in">
                <button onClick={onClose} className="prediction-modal-close-btn" title="Close">
                    <X size={18} />
                </button>
                <h3 className="prediction-modal-title">AI Loan Prediction</h3>
                {isLoadingPrediction ? (
                    <div className="prediction-loading-container">
                        <Loader2 className="prediction-loader" size={28} />
                        <p className="prediction-loading-text">Analyzing loan application...</p>
                    </div>
                ) : predictionData ? (
                    <div className="prediction-main-content-wrapper">
                        <div className="prediction-result-section">
                            <p className="prediction-item">
                                <span className="prediction-label">Predicted Default:</span>
                                <span className={`prediction-value ${predictionData.predicted_default ? 'risk' : 'no-risk'}`}>
                                    {predictionData.predicted_default ? 'High Risk (Default)' : 'Low Risk (No Default)'}
                                </span>
                            </p>
                            <p className="prediction-item">
                                <span className="prediction-label">Probability of Default:</span>
                                <span className="probability-value">
                                    {(predictionData.probability * 100).toFixed(2)}%
                                </span>
                            </p>
                        </div>
                        <div className="prediction-feature-section">
                            <h4 className="prediction-section-subtitle">Model Feature Importances:</h4>
                            {predictionData.top_features && predictionData.top_features.length > 0 ? (
                                <ul className="feature-importances-list">
                                    {predictionData.top_features.map((f, index) => (
                                        <li key={f.feature || index} className="feature-item">
                                            <span className="feature-name">{f.feature}</span>
                                            <span className="feature-percentage">{f.contribution.toFixed(2)}%</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-feature-data">No model feature importance data available.</p>
                            )}
                        </div>
                        <div className="prediction-actions">
                            {loanApprovalStatus === null ? (
                                <>
                                    <button onClick={onApprove} className="prediction-action-btn prediction-approve-btn" disabled={isUpdatingLoanStatus}>
                                        {isUpdatingLoanStatus ? <Loader2 className="prediction-action-spinner" size={16} /> : <CheckCircle size={16} className="prediction-action-icon" />}
                                        <span>Approve</span>
                                    </button>
                                    <button onClick={onReject} className="prediction-action-btn prediction-reject-btn" disabled={isUpdatingLoanStatus}>
                                        {isUpdatingLoanStatus ? <Loader2 className="prediction-action-spinner" size={16} /> : <XCircle size={16} className="prediction-action-icon" />}
                                        <span>Reject</span>
                                    </button>
                                </>
                            ) : (
                                <p className="prediction-status-message">Loan is already {loanApprovalStatus ? 'Approved' : 'Rejected'}.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="no-prediction-data">No prediction data available.</p>
                )}
            </div>
        </div>
    );
};


// Main LoanApplicationView Component (now named ReviewLoan to match route)
const ReviewLoan: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();

    const [loanDetails, setLoanDetails] = useState<LoanApplication | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingApproval, setIsUpdatingApproval] = useState<boolean>(false);
    const [isPredictionModalOpen, setIsPredictionModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchLoanDetails = async () => {
            if (!loanId) {
                setError("Loan ID not provided in the URL.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const parsedLoanId = parseInt(loanId);
                if (isNaN(parsedLoanId)) {
                    setError("Invalid Loan ID format.");
                    setLoading(false);
                    return;
                }

                // Original Supabase data fetching logic
                const { data, error: fetchError } = await supabase
                    .from('Loan')
                    .select(`
                        loan_id,
                        customer_id,
                        customer_annual_income,
                        customer_job_company_name,
                        customer_job_title,
                        customer_job_years,
                        customer_home_ownership,
                        loan_intent,
                        loan_grade,
                        loan_interest_rate,
                        customer_credit_score,
                        customer_credit_history_years,
                        customer_default,
                        application_date,
                        ai_prediction,
                        final_approval,
                        loan_amount,
                        account_number,
                        Customer (first_name, last_name, username, phone_no)
                    `)
                    .eq('loan_id', parsedLoanId)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                if (data) {
                    // Ensure Customer is not an array if it's supposed to be a single object
                    setLoanDetails({
                        ...data,
                        Customer: Array.isArray(data.Customer) ? data.Customer[0] : data.Customer,
                    });
                } else {
                    setError("Loan application not found for this ID.");
                }
            } catch (err: any) {
                console.error("Error fetching loan details:", err);
                setError(err.message || "Failed to load loan details.");
            } finally {
                setLoading(false);
            }
        };

        fetchLoanDetails();
    }, [loanId]);

    const handleBackToDashboard = () => {
        navigate('/admin-dashboard');
    };

    const handleLoanApproval = async (approvalStatus: boolean) => {
        if (!loanDetails) return;
        setIsUpdatingApproval(true);

        try {
            // Original Supabase update logic
            const { error: updateError } = await supabase
                .from('Loan')
                .update({ final_approval: approvalStatus })
                .eq('loan_id', loanDetails.loan_id);

            if (updateError) {
                throw updateError;
            }

            setLoanDetails(prevDetails => prevDetails ? { ...prevDetails, final_approval: approvalStatus } : null);
            // Using a simple alert for now, consider a custom modal/toast for better UX
            alert(`Loan ${approvalStatus ? 'approved' : 'rejected'} successfully!`);
            setIsPredictionModalOpen(false); // Close modal after action
        } catch (err: any) {
            console.error("Error updating loan approval status:", err);
            alert(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`); // Using alert
        } finally {
            setIsUpdatingApproval(false);
        }
    };

    const handleViewPredictionDetails = () => {
        setIsPredictionModalOpen(true);
    };

    const handleClosePredictionModal = () => {
        setIsPredictionModalOpen(false);
    };

    return (
        <div className="loan-view-container">
            {/* Inlining the CSS here for guaranteed compilation in this environment */}
            <style>{inlinedAdminCss}</style>

            {loading ? (
                <div className="loan-loading-state">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p>Loading loan details...</p>
                </div>
            ) : error ? (
                <div className="loan-error-state">
                    <p>Error: {error}</p>
                    <button onClick={handleBackToDashboard} className="admin-smt-btn admin-smt-btn-primary">Back to Dashboard</button>
                </div>
            ) : !loanDetails ? (
                <div className="loan-no-data-state">
                    <p>No loan details available for this ID.</p>
                    <button onClick={handleBackToDashboard} className="admin-smt-btn admin-smt-btn-primary">Back to Dashboard</button>
                </div>
            ) : (
                <>
                    <h2 className="loan-page-title">Loan Application Details (ID: {String(loanDetails.loan_id).substring(0, 8)}...)</h2>

                    {/* Main card displaying loan details organized into sections */}
                    <div className="loan-details-card">
                        {/* Personal Details Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Personal Details</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Customer Name:</p>
                                    <p className="detail-value">{loanDetails.Customer?.first_name} {loanDetails.Customer?.last_name}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Customer Email:</p>
                                    <p className="detail-value">{loanDetails.Customer?.username}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Customer Phone:</p>
                                    <p className="detail-value">{loanDetails.Customer?.phone_no}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Home Ownership:</p>
                                    <p className="detail-value">{loanDetails.customer_home_ownership || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Customer Defaulted:</p>
                                    <p className="detail-value">{loanDetails.customer_default !== null ? (loanDetails.customer_default ? 'Yes' : 'No') : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loan Details Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Loan Details</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Loan Amount:</p>
                                    <p className="detail-value">${loanDetails.loan_amount?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Loan Intent:</p>
                                    <p className="detail-value">{loanDetails.loan_intent || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Application Date:</p>
                                    <p className="detail-value">{loanDetails.application_date ? new Date(loanDetails.application_date).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Final Approval:</p>
                                    <p className="detail-value">
                                        <span className={`status-badge ${getStatusClass(loanDetails.final_approval)}`}>
                                            {loanDetails.final_approval === true ? 'Approved' :
                                            loanDetails.final_approval === false ? 'Rejected' : 'Pending'}
                                        </span>
                                    </p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Loan Grade:</p>
                                    <p className="detail-value">{loanDetails.loan_grade || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Interest Rate:</p>
                                    <p className="detail-value">{loanDetails.loan_interest_rate !== null ? `${loanDetails.loan_interest_rate}%` : 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Account Number:</p>
                                    <p className="detail-value">{loanDetails.account_number || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Employment Details Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Employment Details</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Annual Income:</p>
                                    <p className="detail-value">${loanDetails.customer_annual_income?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Job Title:</p>
                                    <p className="detail-value">{loanDetails.customer_job_title || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Company:</p>
                                    <p className="detail-value">{loanDetails.customer_job_company_name || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Years at Job:</p>
                                    <p className="detail-value">{loanDetails.customer_job_years !== null ? loanDetails.customer_job_years : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Credit Information Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Credit Information</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Credit Score:</p>
                                    <p className="detail-value">{loanDetails.customer_credit_score || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Credit History (Years):</p>
                                    <p className="detail-value">{loanDetails.customer_credit_history_years !== null ? loanDetails.customer_credit_history_years : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Prediction (if available) - Now includes a button to view details */}
                        {loanDetails.ai_prediction && (
                            <div className="ai-prediction-group">
                                <button
                                    className="view-prediction-button"
                                    onClick={handleViewPredictionDetails}
                                    disabled={isPredictionModalOpen}
                                >
                                    View Prediction Details
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action buttons for approving/rejecting the loan */}
                    <div className="action-buttons-container">
                        <button
                            className="action-button approve-button"
                            onClick={() => handleLoanApproval(true)}
                            disabled={isUpdatingApproval || loanDetails.final_approval !== null}
                        >
                            {isUpdatingApproval ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Approving...</span>
                                </>
                            ) : (
                                <span>Approve Loan</span>
                            )}
                        </button>
                        <button
                            className="action-button reject-button"
                            onClick={() => handleLoanApproval(false)}
                            disabled={isUpdatingLoanStatus || loanDetails.final_approval !== null}
                        >
                            {isUpdatingLoanStatus ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Rejecting...</span>
                                </>
                            ) : (
                                <span>Reject Loan</span>
                            )}
                        </button>
                    </div>

                    {/* PredictionResult Modal */}
                    <PredictionResult
                        isOpen={isPredictionModalOpen}
                        onClose={handleClosePredictionModal}
                        predictionData={loanDetails.ai_prediction}
                        isLoadingPrediction={false}
                        onApprove={() => handleLoanApproval(true)}
                        onReject={() => handleLoanApproval(false)}
                        isUpdatingLoanStatus={isUpdatingApproval}
                        loanApprovalStatus={loanDetails.final_approval}
                    />
                </>
            )}
        </div>
    );
};

export default ReviewLoan;
