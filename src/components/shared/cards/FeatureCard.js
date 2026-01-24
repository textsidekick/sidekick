const FeatureCard = ({ feature, idx }) => {
  const { title, desc, icon } = feature ? feature : {};
  return (
    <div
      className="choose-item wow fadeInUp rightSwipe"
      data-wow-delay={`${0.2 + idx * 0.2}s`}
      style={{
        backgroundColor: 'rgba(245, 243, 240, 0.8)',
        borderRadius: '24px',
        padding: '40px 32px',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <span className="icon" style={{color: '#1A1615'}}>
        <i className={icon}></i>
      </span>
      <div className="content">
        <h5 className="title" style={{color: '#1A1615'}}>{title}</h5>
        <p className="desc" style={{color: '#1A1615aa'}}>{desc}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
