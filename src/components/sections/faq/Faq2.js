import FaqItem from "@/components/shared/faq/FaqItem";
import BootstrapWrapper from "@/components/shared/wrappers/BootstrapWrapper";

const Faq2 = ({ type = 1 }) => {
  const items = [
    {
      title: "How does Sidekick work?",
      desc: "Workers simply text their questions to Sidekick's phone number. Our AI reads your company documents (handbooks, SOPs, policies) and responds with accurate answers in seconds—in any language. No app downloads or training required.",
      initActive: true,
    },
    {
      title: "What languages does Sidekick support?",
      desc: "Sidekick supports 10+ languages including Spanish, Korean, Mandarin, Vietnamese, Tagalog, and more. Workers can text or send voice memos in their native language and receive responses in the same language.",
      initActive: false,
    },
    {
      title: "How do I set up Sidekick for my team?",
      desc: "Setup takes less than 30 minutes. Simply upload your company documents (PDFs, Word docs, or paste text), and Sidekick automatically learns your policies. Then share the phone number with your team—that's it!",
      initActive: false,
    },
    {
      title: "What kind of questions can workers ask?",
      desc: "Anything covered in your company documents: PTO policies, safety procedures, benefits information, dress code, clock-in procedures, equipment instructions, and more. If it's in your docs, Sidekick can answer it.",
      initActive: false,
    },
    {
      title: "How does the manager dashboard work?",
      desc: "Managers get a real-time dashboard showing trending questions, knowledge gaps, and AI-suggested improvements. You can see what topics confuse new hires most and proactively update your training materials.",
      initActive: false,
    },
  ];
  
  return (
    <section className="tj-faq-section section-gap">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-lg-5">
            <div style={{
              backgroundColor: 'rgba(245, 243, 240, 0.9)',
              borderRadius: '32px',
              padding: '40px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <span className="sub-title wow fadeInUp" data-wow-delay=".3s" style={{color: '#1A1615', borderColor: '#1A161530', marginBottom: '20px'}}>
                <i className="tji-box" style={{color: '#1A1615'}}></i>Common Questions
              </span>
              <h2 className="sec-title title-anim" style={{color: '#1A1615', marginBottom: '20px'}}>
                Frequently Asked <span style={{color: '#1A1615'}}>Questions</span>
              </h2>
              <p style={{color: '#1A1615aa', fontSize: '16px', lineHeight: '1.7', marginBottom: '30px'}}>
                Everything you need to know about Sidekick. Can't find the answer you're looking for? Book a demo and we'll walk you through it.
              </p>
              <div>
                <a 
                  href="https://cal.com/justin-so-xnr0oc/sidekick-demo" 
                  target="_blank"
                  style={{
                    backgroundColor: '#1A1615',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '24px',
                    fontWeight: '500',
                    fontSize: '14px',
                    display: 'inline-block',
                    textDecoration: 'none'
                  }}
                >
                  Book a Demo
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <BootstrapWrapper>
              <div className="accordion tj-faq" id="faqOne">
                {items?.length
                  ? items?.map((item, idx) => (
                      <FaqItem key={idx} item={item} idx={idx} />
                    ))
                  : ""}
              </div>
            </BootstrapWrapper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq2;
