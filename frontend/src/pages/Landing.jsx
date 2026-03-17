import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ── tiny helper: scroll reveal ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') || [];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (i * 0.06) + 's';
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── small atoms ── */
function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center"
      style={{ background: '#FEF0EC' }}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#EB5E28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <div className="reveal feature-lp-card"
      style={{ animationDelay: delay + 's' }}>
      <div className="feature-lp-icon">{icon}</div>
      <h3 className="feature-lp-title">{title}</h3>
      <p className="feature-lp-desc">{desc}</p>
    </div>
  );
}

export default function Landing() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef} style={{ fontFamily: "'Monda', sans-serif", overflowX: 'hidden' }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-lp-card {
          padding: 36px 32px;
          border: 1.5px solid #f0e8e8;
          border-radius: 24px;
          background: white;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-lp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #EB5E28, #23B5D3);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-lp-card:hover {
          border-color: #EFA7A7;
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(239,167,167,0.2);
        }
        .feature-lp-card:hover::before { opacity: 1; }
        .feature-lp-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: #FEF0EC;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .feature-lp-title {
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #111;
          margin-bottom: 12px;
        }
        .feature-lp-desc {
          font-family: 'Monda', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #6B6B6B;
        }

        .step-circle {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: white;
          border: 3px solid #EFA7A7;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          font-family: 'Bebas Neue', cursive;
          font-size: 28px;
          color: #EB5E28;
          transition: all 0.3s;
        }
        .step-wrap:hover .step-circle {
          background: #EB5E28;
          color: white;
          border-color: #EB5E28;
          transform: scale(1.1);
        }

        .module-lp-card {
          border-radius: 28px;
          overflow: hidden;
          border: 1.5px solid #f0e8e8;
          transition: all 0.3s;
        }
        .module-lp-card:hover {
          border-color: #EFA7A7;
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(239,167,167,0.18);
        }

        .bed-bar-fill-anim {
          height: 100%;
          border-radius: 999px;
          transition: width 1.2s ease;
        }

        @keyframes livepulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        .live-dot-anim { animation: livepulse 1.5s ease-in-out infinite; }

        @keyframes crossfloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
        .cross-float { animation: crossfloat 6s ease-in-out infinite; }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-anim-1 { animation: heroFadeUp 0.7s 0.0s ease both; }
        .hero-anim-2 { animation: heroFadeUp 0.7s 0.1s ease both; }
        .hero-anim-3 { animation: heroFadeUp 0.7s 0.2s ease both; }
        .hero-anim-4 { animation: heroFadeUp 0.7s 0.3s ease both; }
        .hero-anim-5 { animation: heroFadeUp 0.8s 0.2s ease both; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(24px,5vw,80px)',
        paddingTop: '120px',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
      }}>
        {/* Bg decorations */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', right: '-120px', top: '50%', transform: 'translateY(-50%)',
            width: '680px', height: '680px', borderRadius: '50%',
            background: 'radial-gradient(circle, #EFA7A7 0%, #EFA7A7cc 40%, transparent 70%)',
            opacity: 0.15,
          }} />
          <div style={{ position:'absolute', right:'40%', top:'18%', fontSize:'24px', color:'#EFA7A7', opacity:0.2 }}
            className="cross-float">✚</div>
          <div style={{ position:'absolute', left:'52%', top:'62%', fontSize:'18px', color:'#EFA7A7', opacity:0.2, animationDelay:'1.5s' }}
            className="cross-float">✚</div>
          <div style={{ position:'absolute', left:'62%', top:'30%', fontSize:'14px', color:'#EFA7A7', opacity:0.18, animationDelay:'0.8s' }}
            className="cross-float">✚</div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          alignItems: 'center', gap: '60px' }}>

          {/* LEFT */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-anim-1" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#FEF0EC', border: '1.5px solid #EFA7A7',
              borderRadius: '999px', padding: '6px 16px',
              fontFamily: 'Monda, sans-serif', fontSize: '12px', fontWeight: 700,
              color: '#EB5E28', letterSpacing: '0.5px', marginBottom: '28px',
            }}>
              <span className="live-dot-anim" style={{ width: 7, height: 7, borderRadius: '50%', background: '#EB5E28', display:'inline-block' }} />
              Healthcare Coordination · Real Time
            </div>

            <h1 className="hero-anim-2" style={{
              fontFamily: '"Bebas Neue", cursive',
              fontSize: 'clamp(64px, 8vw, 100px)',
              lineHeight: 0.92, letterSpacing: '1px',
              color: '#111', marginBottom: '24px',
            }}>
              Connect<br />
              <span style={{ color: '#EB5E28' }}>Care.</span><br />
              <span style={{ WebkitTextStroke: '2px #EFA7A7', color: 'transparent' }}>Save</span> Lives.
            </h1>

            <p className="hero-anim-3" style={{
              fontSize: '18px', lineHeight: 1.7, color: '#6B6B6B',
              maxWidth: '460px', marginBottom: '40px',
            }}>
              Pranika unifies hospital registries, live bed availability, and patient transfers — so critical seconds are never lost to scattered systems.
            </p>

            <div className="hero-anim-4" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#EB5E28', color: 'white',
                fontFamily: 'Monda, sans-serif', fontWeight: 700, fontSize: '15px',
                padding: '14px 32px', borderRadius: '999px', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(235,94,40,0.35)',
                transition: 'all 0.25s',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(235,94,40,0.45)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(235,94,40,0.35)'; }}
              >
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/hospital/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: '#EB5E28',
                fontFamily: 'Monda, sans-serif', fontWeight: 700, fontSize: '15px',
                padding: '14px 32px', borderRadius: '999px',
                border: '2px solid #EB5E28', textDecoration: 'none',
                transition: 'all 0.25s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = '#EB5E28'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#EB5E28'; e.currentTarget.style.transform = ''; }}
              >
                Hospital Sign Up
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <a href="#modules" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: '#111',
                fontFamily: 'Monda, sans-serif', fontWeight: 700, fontSize: '15px',
                padding: '14px 32px', borderRadius: '999px',
                border: '2px solid #e0d8d5', textDecoration: 'none',
                transition: 'all 0.25s',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#EFA7A7'; e.currentTarget.style.color = '#EB5E28'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e0d8d5'; e.currentTarget.style.color = '#111'; }}
              >
                Explore Modules
              </a>
            </div>
          </div>

          {/* RIGHT: dashboard mockup */}
          <div className="hero-anim-5" style={{ position: 'relative' }}>
            {/* Floating stat cards */}
            <div style={{
              position: 'absolute', top: '-18px', left: '-20px', minWidth: '130px',
              background: 'white', border: '1.5px solid #f0e8e8', borderRadius: '16px',
              padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 3,
            }}>
              <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '28px', color: '#EB5E28', lineHeight: 1 }}>247</div>
              <div style={{ fontFamily: 'Monda, sans-serif', fontSize: '11px', color: '#6B6B6B', marginTop: '2px' }}>Hospitals Active</div>
            </div>
            <div style={{
              position: 'absolute', bottom: '-14px', right: '-14px', minWidth: '130px',
              background: 'white', border: '1.5px solid #f0e8e8', borderRadius: '16px',
              padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 3,
            }}>
              <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '28px', color: '#EB5E28', lineHeight: 1 }}>98%</div>
              <div style={{ fontFamily: 'Monda, sans-serif', fontSize: '11px', color: '#6B6B6B', marginTop: '2px' }}>Transfer Success</div>
            </div>

            {/* Main card */}
            <div style={{
              background: 'white', border: '1.5px solid #f0e8e8', borderRadius: '24px',
              padding: '28px', boxShadow: '0 20px 60px rgba(239,167,167,0.2), 0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px' }}>Live Hospital Availability</span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: '#ECFDF5', borderRadius: '999px', padding: '4px 10px',
                  fontFamily: 'Monda, sans-serif', fontSize: '11px', fontWeight: 700, color: '#059669',
                }}>
                  <span className="live-dot-anim" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Live
                </span>
              </div>

              {[
                { name: 'AIIMS Bhopal', dist: '2.1 km · Government', pct: 62, color: '#22c55e', status: 'Available', pillCls: { background: '#ECFDF5', color: '#059669' } },
                { name: 'Bansal Hospital', dist: '5.2 km · Private', pct: 12, color: '#ef4444', status: 'Full', pillCls: { background: '#FEF2F2', color: '#DC2626' } },
                { name: 'Apollo Indore', dist: '15 km · Private', pct: 38, color: '#f59e0b', status: 'Limited', pillCls: { background: '#FFFBEB', color: '#D97706' } },
                { name: 'Medanta Indore', dist: '18.7 km · Private', pct: 75, color: '#22c55e', status: 'Available', pillCls: { background: '#ECFDF5', color: '#059669' } },
              ].map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '12px',
                  marginBottom: i === 3 ? 0 : '8px',
                  transition: 'background 0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.background = '#fdf8f7'}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '13px', color: '#111' }}>{h.name}</div>
                    <div style={{ fontFamily: 'Monda, sans-serif', fontSize: '11px', color: '#6B6B6B', marginTop: '2px' }}>{h.dist}</div>
                  </div>
                  <div style={{ width: '80px', margin: '0 14px' }}>
                    <div style={{ fontFamily: 'Monda, sans-serif', fontSize: '10px', color: '#6B6B6B', marginBottom: '3px' }}>ICU Beds</div>
                    <div style={{ height: '6px', background: '#F3EDE9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div className="bed-bar-fill-anim" style={{ width: h.pct + '%', background: h.color }} />
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'Monda, sans-serif', fontSize: '10px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '999px', ...h.pillCls,
                  }}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div style={{ background: '#EFA7A7', padding: '40px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {[
            { num: '247+', label: 'Hospitals Connected' },
            { num: '12K+', label: 'Beds Tracked Daily' },
            { num: '98%',  label: 'Transfer Success Rate' },
            { num: '<3min', label: 'Avg. Coordination Time' },
          ].map(s => (
            <div key={s.num} className="reveal" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '52px', color: 'white', letterSpacing: '1px', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: 'Monda, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px clamp(24px,5vw,80px)', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal" style={{ fontFamily:'Monda,sans-serif', fontSize:'12px', fontWeight:700, color:'#EB5E28', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px' }}>Why Pranika</div>
          <h2 className="reveal" style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'clamp(40px,5vw,56px)', color:'#111', letterSpacing:'1px', lineHeight:1, marginBottom:'16px' }}>
            Built for <span style={{ color:'#EB5E28' }}>Speed</span><br />in Critical Moments
          </h2>
          <p className="reveal" style={{ fontFamily:'Monda,sans-serif', fontSize:'16px', color:'#6B6B6B', maxWidth:'520px', lineHeight:1.7, marginBottom:'60px' }}>
            Every feature is designed to eliminate the minutes wasted on phone calls, outdated spreadsheets, and disconnected systems.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'28px' }}>
            {[
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
                title: 'Unified Hospital Registry', desc: 'Search every hospital in your region — filtered by specialty, distance, and type. No more calling around.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
                title: 'Real-Time Bed Tracking', desc: 'ICU beds, general beds, ventilators, oxygen — all updated live. Color-coded status means instant situational awareness.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
                title: 'Smart Transfer Matching', desc: 'Enter patient condition and required resources. Pranika instantly surfaces the best available hospitals ranked by distance.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
                title: 'Secure JWT Authentication', desc: 'Role-based access with JWT tokens, bcrypt hashing, and math captcha. Patient data stays protected.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
                title: 'Transfer History', desc: 'Full audit trail of every transfer request — status, ETA, target hospital, and required resources.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EB5E28" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
                title: 'Fully Responsive', desc: 'Works on any device. Doctors on rounds, coordinators at desks, admins on tablets — Pranika adapts.' },
            ].map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '100px clamp(24px,5vw,80px)', background: '#F9F5F3' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal" style={{ fontFamily:'Monda,sans-serif', fontSize:'12px', fontWeight:700, color:'#EB5E28', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px' }}>The Workflow</div>
          <h2 className="reveal" style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'clamp(40px,5vw,56px)', color:'#111', letterSpacing:'1px', lineHeight:1, marginBottom:'16px' }}>
            From Crisis to <span style={{ color: '#EB5E28' }}>Coordinated</span>
          </h2>
          <p className="reveal" style={{ fontFamily:'Monda,sans-serif', fontSize:'16px', color:'#6B6B6B', maxWidth:'480px', lineHeight:1.7, marginBottom:'60px' }}>
            Four steps. Under three minutes. Patient safely on the way.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'32px', position:'relative' }}>
            {[
              { n: '01', title: 'Search Hospitals', desc: 'Browse the unified registry. Filter by specialty, distance, and hospital type.' },
              { n: '02', title: 'Check Live Beds', desc: 'See real-time ICU, general beds, ventilators and oxygen status across all hospitals.' },
              { n: '03', title: 'Get Smart Match', desc: 'Enter patient condition and resources needed. Get ranked hospitals with ETAs.' },
              { n: '04', title: 'Confirm Transfer', desc: 'Review the match, confirm in one click. Status is tracked automatically.' },
            ].map(s => (
              <div key={s.n} className="reveal step-wrap" style={{ textAlign: 'center', padding: '0 20px' }}>
                <div className="step-circle">{s.n}</div>
                <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:'15px', color:'#111', marginBottom:'10px' }}>{s.title}</div>
                <div style={{ fontFamily:'Monda,sans-serif', fontSize:'13px', lineHeight:1.6, color:'#6B6B6B' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section id="modules" style={{ padding: '100px clamp(24px,5vw,80px)', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal" style={{ fontFamily:'Monda,sans-serif', fontSize:'12px', fontWeight:700, color:'#EB5E28', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px' }}>Core Modules</div>
          <h2 className="reveal" style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'clamp(40px,5vw,56px)', color:'#111', letterSpacing:'1px', lineHeight:1, marginBottom:'60px' }}>
            Three Platforms.<br /><span style={{ color:'#EB5E28' }}>One Mission.</span>
          </h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'32px' }}>
            {[
              { tag:'Module 01', tagColor:'#EB5E28', tagBg:'rgba(235,94,40,0.12)', headBg:'linear-gradient(135deg,#FEF0EC,#FDE8DF)',
                title:'Unified Hospital Registry', desc:'A single searchable database of every hospital — with specialties, contacts, distances, and real-time availability.',
                features:['Search by name, specialty, or location','Filter by Government, Private, Trust, Clinic','Full detail view with contact and specialties','One-click to check availability or request transfer'] },
              { tag:'Module 02', tagColor:'#0D9CB8', tagBg:'rgba(35,181,211,0.12)', headBg:'linear-gradient(135deg,#E8F7FB,#D6F0F7)',
                title:'Live Availability Dashboard', desc:'Real-time visibility into beds and critical equipment across all hospitals — refreshed continuously.',
                features:['ICU beds, general beds, ventilators, oxygen','Animated bed-fill bars with live percentages','Color-coded: green · yellow · red status','Filter to show only what you need'] },
              { tag:'Module 03', tagColor:'#C74E4E', tagBg:'rgba(239,167,167,0.25)', headBg:'linear-gradient(135deg,#FEF0F5,#FDDDE9)',
                title:'Smart Patient Transfer', desc:'Enter what the patient needs. Get instant ranked suggestions. Confirm in one click — with full audit trail.',
                features:['Resource-aware matching (ICU, Ventilator, Specialist)','Distance-ranked suggestions with ETA','Confirmation panel before committing','Full history with status tracking'] },
            ].map(m => (
              <div key={m.tag} className="reveal module-lp-card">
                <div style={{ padding:'36px 36px 28px', background: m.headBg }}>
                  <span style={{ fontFamily:'Monda,sans-serif', fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', padding:'5px 12px', borderRadius:'999px', background: m.tagBg, color: m.tagColor, display:'inline-block', marginBottom:'16px' }}>
                    {m.tag}
                  </span>
                  <div style={{ fontFamily:'Roboto,sans-serif', fontWeight:700, fontSize:'22px', color:'#111', marginBottom:'10px' }}>{m.title}</div>
                  <div style={{ fontFamily:'Monda,sans-serif', fontSize:'14px', lineHeight:1.65, color:'#6B6B6B' }}>{m.desc}</div>
                </div>
                <div style={{ background:'white', padding:'24px 36px 28px', borderTop:'1.5px solid #f0e8e8' }}>
                  <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
                    {m.features.map(f => (
                      <li key={f} style={{ display:'flex', alignItems:'center', gap:'10px', fontFamily:'Monda,sans-serif', fontSize:'13px', color:'#6B6B6B' }}>
                        <CheckIcon />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding:'100px clamp(24px,5vw,80px)', background:'#111', position:'relative', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(#EFA7A7,transparent)', top:'-100px', right:'-100px', opacity:0.06 }} />
          <div style={{ position:'absolute', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(#23B5D3,transparent)', bottom:'-60px', left:'10%', opacity:0.07 }} />
        </div>
        <h2 className="reveal" style={{ fontFamily:'"Bebas Neue",cursive', fontSize:'clamp(48px,6vw,80px)', color:'white', letterSpacing:'2px', lineHeight:1, marginBottom:'20px', position:'relative', zIndex:2 }}>
          Ready to <span style={{ color:'#EFA7A7' }}>Coordinate</span><br />Better Care?
        </h2>
        <p className="reveal" style={{ fontFamily:'Monda,sans-serif', fontSize:'17px', color:'rgba(255,255,255,0.6)', maxWidth:'480px', margin:'0 auto 40px', lineHeight:1.7, position:'relative', zIndex:2 }}>
          Join the platform connecting hospitals. Free to get started. No setup required.
        </p>
        <div className="reveal" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'24px', flexWrap:'wrap', position:'relative', zIndex:2 }}>
          <Link to="/signup" style={{
            background:'#EFA7A7', color:'white',
            fontFamily:'Monda,sans-serif', fontWeight:700, fontSize:'15px',
            padding:'14px 36px', borderRadius:'999px', textDecoration:'none',
            transition:'all 0.25s',
          }}
            onMouseOver={e => { e.currentTarget.style.background='#e89090'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.background='#EFA7A7'; e.currentTarget.style.transform=''; }}
          >
            Create Free Account →
          </Link>
          <Link to="/login" style={{
            color:'rgba(255,255,255,0.6)', fontFamily:'Monda,sans-serif', fontSize:'14px',
            textDecoration:'none', borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'2px',
            transition:'color 0.2s, border-color 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='white'; }}
            onMouseOut={e => { e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}
          >
            Already have an account? Sign in
          </Link>
        </div>
      </section>

    </div>
  );
}
