import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>
        Surplus Food Donation & NGO Coordination System &copy; {currentYear}. Production-Ready Student Project.
      </p>
    </footer>
  );
}

export default Footer;
