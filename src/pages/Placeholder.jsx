import React from 'react';

const Placeholder = ({ title, subtitle }) => {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
      <div className="card">
        <h2 className="section-title">Module coming soon...</h2>
      </div>
    </div>
  );
};

export default Placeholder;
