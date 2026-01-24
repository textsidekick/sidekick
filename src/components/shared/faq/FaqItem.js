"use client";

const FaqItem = ({ item = {}, idx }) => {
  const { title, desc, initActive } = item;
  return (
    <div 
      className="accordion-item"
      style={{
        backgroundColor: 'rgba(245, 243, 240, 0.9)',
        borderRadius: '20px',
        marginBottom: '12px',
        border: 'none',
        overflow: 'hidden',
      }}
    >
      <button
        className={`faq-title ${initActive ? "" : "collapsed"}`}
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#faq-${idx + 1}`}
        aria-expanded={initActive ? true : false}
        style={{
          backgroundColor: 'transparent',
          color: '#1A1615',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          padding: '24px 28px',
          fontSize: '16px',
          fontWeight: '600',
        }}
      >
        {title}
      </button>
      <div
        id={`faq-${idx + 1}`}
        className={`collapse ${initActive ? "show" : ""}`}
        data-bs-parent="#faqOne"
      >
        <div 
          className="accordion-body faq-text"
          style={{
            padding: '0 28px 24px',
          }}
        >
          <p style={{color: '#1A1615aa', lineHeight: '1.7', margin: 0}}>{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
