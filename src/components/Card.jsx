import React from 'react';

const Card = ({ children, title, subtitle, extra, className = '', ...props }) => {
  return (
    <div className={`glass-panel ${className}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} {...props}>
      {(title || subtitle || extra) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{subtitle}</p>}
          </div>
          {extra && <div style={{ display: 'flex', alignItems: 'center' }}>{extra}</div>}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
