import Image from "next/image";

const TestimonialsCard1 = ({ testimonial }) => {
  const { authorName, authorDesig, desc, img, logoImg, logoImgLight } =
    testimonial ? testimonial : {};
  return (
    <div className="testimonial-item" style={{
      backgroundColor: 'rgba(245, 243, 240, 0.9)',
      borderRadius: '24px',
      padding: '40px',
      border: 'none',
      boxShadow: 'none',
    }}>
      <div className="desc" style={{marginBottom: '24px'}}>
        <p style={{color: '#1A1615', fontSize: '17px', lineHeight: '1.7', fontStyle: 'normal'}}>"{desc}"</p>
      </div>
      <div className="testimonial-author">
        <div className="author-inner" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div className="author-img">
            <Image
              src={img ? img : "/images/testimonial/client-1.webp"}
              alt="Images"
              width={56}
              height={56}
              style={{ height: "56px", width: "56px", borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div className="author-header">
            <h4 className="title" style={{color: '#1A1615', fontSize: '16px', fontWeight: '600', marginBottom: '4px'}}>{authorName}</h4>
            <span className="designation" style={{color: '#1A1615aa', fontSize: '14px'}}>{authorDesig}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCard1;
