"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Obsługa tokenów z hash URL (dla Google OAuth)
  useEffect(() => {
    const handleHashToken = async () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('Found access token in hash, redirecting to callback...');
          // Przekieruj do callback page, który obsłuży token
          router.push('/auth/callback');
        }
      }
    };

    handleHashToken();
  }, [router]);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  };

  // Pokaż loading state podczas ładowania danych autoryzacji
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 text-gray-800 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-96 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-80 mx-auto"></div>
              <div className="flex gap-4 justify-center">
                <div className="h-12 bg-gray-200 rounded w-32"></div>
                <div className="h-12 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 text-gray-800 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-10">
            <motion.div 
              className="lg:w-1/2"
              variants={itemVariants}
            >
              <motion.div 
                className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="text-blue-600 font-medium text-sm">Nowość • Dostępne teraz</span>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                variants={itemVariants}
              >
                Kontroluj koszty swojego remontu 
                <span className="text-blue-600 block">w prosty sposób</span>
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10"
                variants={itemVariants}
              >
                Dodawaj pokoje, zapisuj wydatki, dołączaj zdjęcia paragonów i miej pełną kontrolę nad budżetem swojego domu lub mieszkania.
              </motion.p>
            </motion.div>
            <motion.div 
              className="lg:w-1/2 flex justify-center"
              variants={imageVariants}
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                ></motion.div>
                                 <motion.img 
                   src="/main-photo.png" 
                   alt="Kontrola kosztów remontu" 
                   className="relative rounded-2xl shadow-2xl max-w-full h-auto"
                   style={{ maxHeight: '500px' }}
                 />
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex gap-4 flex-col sm:flex-row justify-center"
            variants={itemVariants}
          >
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/projekty"
                  className="px-8 py-4 rounded-xl bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition-all hover:shadow-xl transform hover:-translate-y-1 block"
                >
                  Zarządzaj projektami
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl transform hover:-translate-y-1 block"
                  >
                    Zaloguj się
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className="px-8 py-4 rounded-xl bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition-all hover:shadow-xl transform hover:-translate-y-1 block"
                  >
                    Zarejestruj się
                  </Link>
                </motion.div>
              </>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="#video-demo"
                className="px-8 py-4 rounded-xl border border-gray-200 bg-white font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md block"
              >
                Zobacz demo
              </a>
            </motion.div>
          </motion.div>
        </motion.div>        
      </main>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h3 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Jak to działa?
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                title: "Dodaj pokoje",
                description: "Stwórz plan swojego mieszkania lub domu, dodając wszystkie pomieszczenia."
              },
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Śledź wydatki",
                description: "Dodawaj wszystkie koszty remontu i kategoryzuj je według pokoi."
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Analizuj budżet",
                description: "Otrzymuj szczegółowe raporty i analizy wydatków na każdym etapie remontu."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-all hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </motion.div>
                <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6">Proste zarządzanie remontem</h3>
              <p className="text-lg text-gray-600 mb-6">
                Nasza aplikacja pomaga utrzymać porządek w dokumentach i kosztach remontu. 
                Przechowuj wszystkie paragony w jednym miejscu, śledź postępy prac i nie przekraczaj zaplanowanego budżetu.
              </p>
              <ul className="space-y-3">
                {[
                  "Przechowuj zdjęcia paragonów w chmurze",
                  "Ustaw powiadomienia o zbliżającym się limicie budżetu",
                  "Eksportuj dane do plików PDF i Excel"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative max-w-md">
                <motion.div 
                  className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                ></motion.div>
                                 <motion.img 
                   src="/reno2.png" 
                   alt="Zespół remontowy podczas pracy" 
                   className="relative rounded-2xl shadow-2xl max-w-full h-auto"
                   style={{ maxHeight: '350px' }}
                 />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Video Demo Section */}
      <section id="video-demo" className="py-16 px-6 bg-white">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-4">Zobacz jak to działa</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Krótka demonstracja pokazująca jak łatwo możesz zarządzać kosztami swojego remontu
            </p>
          </motion.div>
          
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-4xl">
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.youtube.com/embed/2VtMc5iaPdY"
                  title="Demonstracja aplikacji do zarządzania remontem"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h3 
            className="text-3xl font-bold mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Co mówią nasi użytkownicy?
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                initials: "AK",
                name: "Anna Kowalska",
                project: "Remont kawalerki",
                testimonial: "Dzięki tej aplikacji zaoszczędziłam ponad 3000 zł na nieplanowanych wydatkach. Świetne narzędzie do kontroli budżetu!"
              },
              {
                initials: "TP",
                name: "Tomasz Nowak",
                project: "Remont domu",
                testimonial: "Przydatne zwłaszcza przy większych remontach, gdzie łatwo stracić kontrolę nad wydatkami. Polecam!"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-blue-50 p-6 rounded-xl hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {testimonial.initials}
                  </motion.div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.project}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.testimonial}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h3 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Zacznij kontrolować swój remont już dziś!
          </motion.h3>
          <motion.p 
            className="text-lg mb-10 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Dołącz do tysięcy zadowolonych użytkowników i zakończ remont bez niespodzianek budżetowych.
          </motion.p>
          
          <motion.div 
            className="flex gap-4 flex-col sm:flex-row justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/projekty"
                  className="px-8 py-4 rounded-xl bg-white text-green-600 font-semibold shadow-lg hover:bg-green-50 transition-all hover:shadow-xl transform hover:-translate-y-1 block"
                >
                  Zarządzaj projektami
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:bg-blue-50 transition-all hover:shadow-xl transform hover:-translate-y-1 block"
                  >
                    Zaloguj się
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className="px-8 py-4 rounded-xl bg-white text-green-600 font-semibold shadow-lg hover:bg-green-50 transition-all hover:shadow-xl transform hover:-translate-y-1 block"
                  >
                    Zarejestruj się
                  </Link>
                </motion.div>
              </>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="#video-demo"
                className="px-8 py-4 rounded-xl border border-white bg-transparent font-medium hover:bg-white hover:bg-opacity-10 transition-all block"
              >
                Zobacz demo
              </a>
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="mt-8 text-sm opacity-80"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Bez zobowiązań, bez podawania karty kredytowej
          </motion.p>
        </motion.div>
      </section>
    </div>
  );
}