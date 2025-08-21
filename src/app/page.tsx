import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 text-gray-800 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-6">
              <span className="text-blue-600 font-medium text-sm">Nowość • Dostępne teraz</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Kontroluj koszty swojego remontu 
              <span className="text-blue-600 block">w prosty sposób</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Dodawaj pokoje, zapisuj wydatki, dołączaj zdjęcia paragonów i miej pełną kontrolę nad budżetem swojego domu lub mieszkania.
            </p>
          </div>
          
          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Link
              href="/pokoje"
              className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl transform hover:-translate-y-1"
            >
              Zarządzaj pokojami
            </Link>
            <Link
              href="/projekty"
              className="px-8 py-4 rounded-xl bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition-all hover:shadow-xl transform hover:-translate-y-1"
            >
              Zarządzaj projektami
            </Link>
            <a
              href="#"
              className="px-8 py-4 rounded-xl border border-gray-200 bg-white font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
            >
              Zobacz demo
            </a>
          </div>
        </div>        
      </main>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Jak to działa?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-2">Dodaj pokoje</h4>
              <p className="text-gray-600">Stwórz plan swojego mieszkania lub domu, dodając wszystkie pomieszczenia.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-2">Śledź wydatki</h4>
              <p className="text-gray-600">Dodawaj wszystkie koszty remontu i kategoryzuj je według pokoi.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-bold text-lg mb-2">Analizuj budżet</h4>
              <p className="text-gray-600">Otrzymuj szczegółowe raporty i analizy wydatków na każdym etapie remontu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-bold mb-6">Proste zarządzanie remontem</h3>
              <p className="text-lg text-gray-600 mb-6">
                Nasza aplikacja pomaga utrzymać porządek w dokumentach i kosztach remontu. 
                Przechowuj wszystkie paragony w jednym miejscu, śledź postępy prac i nie przekraczaj zaplanowanego budżetu.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Przechowuj zdjęcia paragonów w chmurze</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Ustaw powiadomienia o zbliżającym się limicie budżetu</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Eksportuj dane do plików PDF i Excel</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-white rounded-xl shadow-lg p-6 transform rotate-3 absolute -inset-1 border border-blue-100 opacity-20"></div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform -rotate-2 absolute -inset-1 border border-blue-100 opacity-20"></div>
                <div className="bg-white rounded-xl shadow-lg p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-medium">Salon</div>
                    <div className="text-sm text-blue-600 font-bold">4,250 zł / 5,000 zł</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Farba</div>
                      <div className="font-medium">850 zł</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Panele</div>
                      <div className="font-medium">2,100 zł</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Oświetlenie</div>
                      <div className="font-medium">1,100 zł</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Inne</div>
                      <div className="font-medium">200 zł</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">Co mówią nasi użytkownicy?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">AK</div>
                <div>
                  <div className="font-medium">Anna Kowalska</div>
                  <div className="text-sm text-gray-500">Remont kawalerki</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"Dzięki tej aplikacji zaoszczędziłam ponad 3000 zł na nieplanowanych wydatkach. Świetne narzędzie do kontroli budżetu!"</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">TP</div>
                <div>
                  <div className="font-medium">Tomasz Nowak</div>
                  <div className="text-sm text-gray-500">Remont domu</div>
                </div>
              </div>
              <p className="text-gray-600 italic">"Przydatne zwłaszcza przy większych remontach, gdzie łatwo stracić kontrolę nad wydatkami. Polecam!"</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Zacznij kontrolować swój remont już dziś!</h3>
          <p className="text-lg mb-10 opacity-90">Dołącz do tysięcy zadowolonych użytkowników i zakończ remont bez niespodzianek budżetowych.</p>
          
          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Link
              href="/pokoje"
              className="px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:bg-blue-50 transition-all hover:shadow-xl transform hover:-translate-y-1"
            >
              Zarządzaj pokojami
            </Link>
            <Link
              href="/projekty"
              className="px-8 py-4 rounded-xl bg-white text-green-600 font-semibold shadow-lg hover:bg-green-50 transition-all hover:shadow-xl transform hover:-translate-y-1"
            >
              Zarządzaj projektami
            </Link>
            <a
              href="#"
              className="px-8 py-4 rounded-xl border border-white bg-transparent font-medium hover:bg-white hover:bg-opacity-10 transition-all"
            >
              Zobacz demo
            </a>
          </div>
          
          <p className="mt-8 text-sm opacity-80">Bez zobowiązań, bez podawania karty kredytowej</p>
        </div>
      </section>
    </div>
  );
}