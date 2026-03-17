export default function Footer() {
  return (
    <footer
      className="w-full mt-auto"
      style={{ backgroundColor: '#EFA7A7' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span
          className="text-white tracking-widest"
          style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '24px' }}
        >
          Pranika
        </span>
        <p className="font-monda text-white/80 text-sm text-center">
          Healthcare Coordination Platform · Connecting care, saving lives
        </p>
        <p className="font-monda text-white/60 text-xs">
          © {new Date().getFullYear()} Pranika
        </p>
      </div>
    </footer>
  );
}
