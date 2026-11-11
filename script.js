/**
 * Chandan Ghanghav — Portfolio Script
 * Security hardened: no eval, no innerHTML with user data,
 * strict URL allowlist for external links, CSP-compatible.
 */

'use strict';

/* ── 1. Copyright year (safe DOM text node — no innerHTML) ── */
const yearEl = document.getElementById('year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

/* ── 2. External link safety enforcement ──────────────────────
   Forces every external <a> to have rel="noopener noreferrer"
   and target="_blank" so no opened page can access window.opener.
   Acts as a runtime safety net on top of the HTML attributes.
─────────────────────────────────────────────────────────────── */
function hardenExternalLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
        try {
            const href = link.getAttribute('href');
            if (!href) return;

            // Skip fragment links (#section) and mailto: links
            if (href.startsWith('#') || href.startsWith('mailto:')) return;

            const url = new URL(href, window.location.origin);

            // If the link goes to a different origin, harden it
            if (url.origin !== window.location.origin) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        } catch {
            // Relative or malformed href — leave as-is
        }
    });
}

/* ── 3. Click-time URL validation ─────────────────────────────
   Blocks javascript: and data: links from ever navigating.
   These should never appear in a static portfolio, but this
   acts as a defence-in-depth layer.
─────────────────────────────────────────────────────────────── */
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

function blockDangerousLinks(event) {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    try {
        const url = new URL(href, window.location.origin);
        if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
            event.preventDefault();
            console.warn('[Security] Blocked navigation to unsafe protocol:', url.protocol);
        }
    } catch {
        // Can't parse — block it
        event.preventDefault();
        console.warn('[Security] Blocked navigation to unparseable URL:', href);
    }
}

/* ── 4. Console branding (optional — deters script injection via console) ── */
function consoleBranding() {
    const style = 'color:#3b82f6;font-size:16px;font-weight:bold;';
    console.log('%cChandan Ghanghav Portfolio', style);
    console.log('%cIf someone told you to paste something here, it is a scam!', 'color:red;font-size:13px;');
}

/* ── 5. Scroll-based animation with IntersectionObserver ──────
   Replaces CSS-only animation-delay approach with a proper
   observer so elements only animate when actually visible.
─────────────────────────────────────────────────────────────── */
function initScrollAnimations() {
    const targets = document.querySelectorAll(
        '.website-card, .social-links a, .section h2'
    );

    if (!('IntersectionObserver' in window)) return; // graceful degradation

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // fire once
            }
        });
    }, { threshold: 0.15 });

    targets.forEach(el => {
        el.classList.add('fade-hidden');
        observer.observe(el);
    });
}

/* ── 6. Contact page helpers (copy email & mailto composer) ── */
function initContactHelpers() {
    const copyBtn = document.getElementById('copy-email-btn');
    const copyStatus = document.getElementById('copy-status');
    const emailAddress = 'contactchandan0101@gmail.com';

    if (copyBtn && copyStatus) {
        copyBtn.addEventListener('click', async () => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(emailAddress);
                    copyStatus.textContent = 'Email copied to clipboard.';
                } else {
                    copyStatus.textContent = 'Email: ' + emailAddress;
                }
            } catch {
                copyStatus.textContent = 'Email: ' + emailAddress;
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const nameEl = document.getElementById('sender-name');
            const emailEl = document.getElementById('sender-email');
            const subjectEl = document.getElementById('sender-subject');
            const messageEl = document.getElementById('sender-message');

            const name = nameEl ? nameEl.value.trim() : '';
            const email = emailEl ? emailEl.value.trim() : '';
            const subject = subjectEl ? subjectEl.value.trim() : '';
            const message = messageEl ? messageEl.value.trim() : '';

            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill in your name, email, and message.';
                return;
            }

            const mailSubject = subject || ('Portfolio Inquiry from ' + name);
            const mailBody = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
            const mailtoUrl =
                'mailto:' + emailAddress +
                '?subject=' + encodeURIComponent(mailSubject) +
                '&body=' + encodeURIComponent(mailBody);

            formStatus.textContent = 'Opening your default email client...';
            window.location.href = mailtoUrl;
        });
    }
}

/* ── 7. Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    hardenExternalLinks();
    initScrollAnimations();
    initContactHelpers();
    consoleBranding();
});

document.addEventListener('click', blockDangerousLinks, true); // capture phase
