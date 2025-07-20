import { Navbar } from "@/modules/home/ui/components/navbar"

 const Layout = ({children}: {children: React.ReactNode}) => {
     return (
          <main className="flex flex-col min-h-screen relative">
               <Navbar />

               {/* Enhanced Background - Fixed to viewport */}
               <div className="fixed inset-0 -z-10">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 animate-pulse" />

                    {/* Floating orbs */}
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full blur-3xl animate-pulse delay-500" />

                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:50px_50px]" />

                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
                         <svg className="w-full h-full">
                              <filter id="noise">
                                   <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
                              </filter>
                              <rect width="100%" height="100%" filter="url(#noise)" />
                         </svg>
                    </div>
               </div>

               <div className="flex-1 flex flex-col px-4 pb-4 relative z-10">
                    {children}
               </div>
          </main>
     )
}

export default Layout