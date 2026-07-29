import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlaneTakeoff, Compass, Map, Star, ArrowRight, Calendar, Sparkles, CheckCircle2, Globe, Heart } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function Landing() {
  useSEO('Smart AI Travel Planner', 'Experience intelligent trip planning, interactive routing, live destination hubs, and automated budgets with Voyage AI.');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  return (
    <div className="flex-grow flex flex-col bg-[#FAF9F6] dark:bg-zinc-950 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-20 sm:pt-32 sm:pb-32 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl"
        >
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] dark:text-zinc-100 mb-8 leading-[1.1]">
            Plan your dream trip in <span className="text-[#3b82f6] dark:text-blue-400 italic relative inline-block">minutes.<div className="absolute -bottom-2 left-0 w-full h-3 bg-[#3b82f6]/20 dark:bg-blue-400/20 -rotate-2"></div></span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-[#7D7A74] dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the future of travel planning. Our AI curates personalized itineraries, 
            discovers hidden gems, and optimizes your routes—all in a beautifully simple interface.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/planner"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-sm font-bold rounded-[14px] text-white dark:text-zinc-50 bg-[#3b82f6] dark:bg-blue-600 hover:bg-[#1d4ed8] dark:hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md dark:shadow-xl dark:shadow-blue-900/20"
            >
              Start Planning Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-sm font-bold rounded-[14px] text-[#2D2D2D] dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all shadow-sm"
            >
              Explore Destinations
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white dark:bg-zinc-900/50 border-y border-[#E5E2D9] dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] dark:text-zinc-100 mb-4">How Voyage Works</h2>
            <p className="text-[#7D7A74] dark:text-zinc-400 max-w-2xl mx-auto">Three simple steps to your perfect itinerary.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#E5E2D9] dark:via-zinc-800 to-transparent z-0"></div>
            
            {[
              {
                step: '01',
                title: 'Tell us your preferences',
                desc: 'Share your destination, dates, budget, and travel style.',
                icon: Calendar,
                color: 'text-[#4f46e5] dark:text-indigo-400',
                bg: 'bg-[#4f46e5]/10 dark:bg-indigo-500/10'
              },
              {
                step: '02',
                title: 'AI generates your plan',
                desc: 'Our AI crafts a day-by-day itinerary optimized for travel time and location.',
                icon: Sparkles,
                color: 'text-[#3b82f6] dark:text-blue-400',
                bg: 'bg-[#3b82f6]/10 dark:bg-blue-500/10'
              },
              {
                step: '03',
                title: 'Refine and go',
                desc: 'Adjust the plan, explore the interactive map, and pack your bags.',
                icon: PlaneTakeoff,
                color: 'text-[#1d4ed8] dark:text-blue-300',
                bg: 'bg-[#1d4ed8]/10 dark:bg-blue-400/10'
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${item.bg} border-8 border-white dark:border-zinc-950 shadow-sm`}>
                  <item.icon className={`w-10 h-10 ${item.color}`} />
                </div>
                <div className="text-[10px] font-bold text-[#A8A399] dark:text-zinc-500 tracking-widest uppercase mb-3">Step {item.step}</div>
                <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100 mb-3">{item.title}</h3>
                <p className="text-[#7D7A74] dark:text-zinc-400 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] dark:text-zinc-100 mb-4">Everything you need</h2>
          <p className="text-[#7D7A74] dark:text-zinc-400 max-w-2xl mx-auto">Built for travelers who want to maximize their experiences without the stress of planning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Compass,
              title: 'AI-Powered Itineraries',
              desc: 'Tell us your style, budget, and dates. We generate a complete, day-by-day plan tailored specifically to you.',
              color: 'text-[#4f46e5] dark:text-indigo-400'
            },
            {
              icon: Map,
              title: 'Interactive Mapping',
              desc: 'Visualize your entire journey. Find walking routes, and see exactly where everything is located.',
              color: 'text-[#1d4ed8] dark:text-blue-400'
            },
            {
              icon: Star,
              title: 'Curated Recommendations',
              desc: 'Skip the tourist traps. Get AI-curated suggestions for boutique hotels, authentic dining, and hidden attractions.',
              color: 'text-[#3b82f6] dark:text-blue-500'
            },
            {
              icon: CheckCircle2,
              title: 'Smart Budgeting',
              desc: 'Keep track of estimated costs with automatic budget breakdowns for accommodation, food, and activities.',
              color: 'text-[#059669] dark:text-emerald-400'
            },
            {
              icon: Globe,
              title: 'Offline Access',
              desc: 'Save your itineraries and access them anytime, anywhere—even without an internet connection.',
              color: 'text-[#ea580c] dark:text-orange-400'
            },
            {
              icon: Heart,
              title: 'Personalized Style',
              desc: 'Whether you want a packed adventure or a relaxing getaway, the AI adapts to your desired pace.',
              color: 'text-[#e11d48] dark:text-rose-400'
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-[24px] p-8 text-left border border-[#E5E2D9] dark:border-zinc-800 shadow-sm dark:shadow-xl dark:shadow-black/20 hover:shadow-md transition-all hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 bg-[#FAF9F6] dark:bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 border border-[#E5E2D9] dark:border-zinc-800 group-hover:scale-110 transition-transform">
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100 mb-3">{feature.title}</h3>
              <p className="text-[#7D7A74] dark:text-zinc-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#3b82f6] dark:bg-blue-900 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready for your next adventure?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who are exploring the world smarter, not harder.
          </p>
          <Link
            to="/planner"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-[14px] text-[#3b82f6] dark:text-blue-900 bg-white hover:bg-neutral-50 hover:scale-105 transition-all shadow-xl"
          >
            Start Planning Now
            <PlaneTakeoff className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-[#E5E2D9] dark:border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1d4ed8] dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <PlaneTakeoff className="w-4 h-4 text-white dark:text-zinc-50" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#1d4ed8] dark:text-blue-300 uppercase">Voyage AI</span>
          </div>
          
          <div className="text-[#7D7A74] dark:text-zinc-500 text-sm">
            © {new Date().getFullYear()} Voyage AI. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <Link to="#" className="text-[#7D7A74] dark:text-zinc-500 hover:text-[#2D2D2D] dark:hover:text-zinc-300 text-sm font-medium transition-colors">Privacy</Link>
            <Link to="#" className="text-[#7D7A74] dark:text-zinc-500 hover:text-[#2D2D2D] dark:hover:text-zinc-300 text-sm font-medium transition-colors">Terms</Link>
            <Link to="#" className="text-[#7D7A74] dark:text-zinc-500 hover:text-[#2D2D2D] dark:hover:text-zinc-300 text-sm font-medium transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
