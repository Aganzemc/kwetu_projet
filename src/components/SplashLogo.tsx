import { logoPath } from '../lib/assets';

export default function SplashLogo() {
  const logo = logoPath;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        <img src={logo} alt="Logo" className="h-24 w-auto drop-shadow filter brightness-0" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* <div className="h-28 w-28 rounded-full border-4 border-black/80 dark:border-white/80 border-t-transparent animate-spin"></div> */}
          <div className="absolute h-40 w-40 rounded-full border-4 border-black/40 dark:border-black/40 border-t-transparent animate-[spin_2s_linear_infinite]"></div>
        </div>
      </div>
    </div>
  );
}


