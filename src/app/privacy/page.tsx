"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Powrót do rejestracji
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Polityka Prywatności</h1>
          <p className="text-gray-600">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Wprowadzenie */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Wprowadzenie</h2>
            <p className="text-gray-700 leading-relaxed">
              Niniejsza Polityka Prywatności opisuje, w jaki sposób aplikacja do zarządzania projektami remontowymi 
              ("Aplikacja", "my", "nas", "nasza") zbiera, używa i chroni Twoje dane osobowe. 
              Zobowiązujemy się do ochrony Twojej prywatności i zapewnienia bezpieczeństwa Twoich danych.
            </p>
          </section>

          {/* Administrator danych */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Administrator danych</h2>
            <p className="text-gray-700 leading-relaxed">
              Administratorem Twoich danych osobowych jest zespół deweloperski aplikacji do zarządzania projektami remontowymi. 
              Możesz skontaktować się z nami w sprawach związanych z ochroną danych osobowych.
            </p>
          </section>

          {/* Rodzaje zbieranych danych */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Rodzaje zbieranych danych</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Dane rejestracyjne</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Adres e-mail</li>
                  <li>Hasło (przechowywane w formie zaszyfrowanej)</li>
                  <li>Imię i nazwisko (opcjonalnie)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Dane użytkowania</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Projekty remontowe tworzone przez użytkownika</li>
                  <li>Pokoje i ich specyfikacje</li>
                  <li>Produkty i materiały wybrane do projektów</li>
                  <li>Dane o aktywności w aplikacji</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 Dane techniczne</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Adres IP</li>
                  <li>Informacje o przeglądarce i urządzeniu</li>
                  <li>Dane o sesjach użytkownika</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cel przetwarzania danych */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cel przetwarzania danych</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Twoje dane osobowe są przetwarzane w następujących celach:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Świadczenie usług aplikacji do zarządzania projektami remontowymi</li>
                <li>Uwierzytelnianie i autoryzacja użytkowników</li>
                <li>Przechowywanie i zarządzanie projektami użytkownika</li>
                <li>Komunikacja z użytkownikami w sprawach technicznych</li>
                <li>Poprawa funkcjonalności i bezpieczeństwa aplikacji</li>
                <li>Wypełnianie obowiązków prawnych</li>
              </ul>
            </div>
          </section>

          {/* Podstawa prawna */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Podstawa prawna przetwarzania</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Przetwarzanie Twoich danych osobowych odbywa się na podstawie:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Art. 6 ust. 1 lit. b RODO</strong> - przetwarzanie jest niezbędne do wykonania umowy</li>
                <li><strong>Art. 6 ust. 1 lit. f RODO</strong> - prawnie uzasadniony interes administratora</li>
                <li><strong>Art. 6 ust. 1 lit. a RODO</strong> - zgoda użytkownika (w określonych przypadkach)</li>
              </ul>
            </div>
          </section>

          {/* Okres przechowywania */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Okres przechowywania danych</h2>
            <div className="space-y-4">
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Dane konta:</strong> Przechowywane do momentu usunięcia konta przez użytkownika</li>
                <li><strong>Projekty i dane użytkowania:</strong> Przechowywane do momentu usunięcia konta</li>
                <li><strong>Dane techniczne:</strong> Przechowywane przez okres 12 miesięcy</li>
                <li><strong>Dane o sesjach:</strong> Automatycznie usuwane po zakończeniu sesji</li>
              </ul>
            </div>
          </section>

          {/* Udostępnianie danych */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Udostępnianie danych</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Twoje dane osobowe mogą być udostępniane:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Dostawcom usług hostingowych i technicznych</li>
              <li>Organom władzy publicznej na podstawie przepisów prawa</li>
              <li>Innym użytkownikom wyłącznie w zakresie funkcji udostępniania projektów</li>
            </ul>
          </section>

          {/* Twoje prawa */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Twoje prawa</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Zgodnie z RODO przysługują Ci następujące prawa:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Prawo dostępu</strong> - możesz żądać informacji o przetwarzanych danych</li>
              <li><strong>Prawo do sprostowania</strong> - możesz żądać poprawienia nieprawidłowych danych</li>
              <li><strong>Prawo do usunięcia</strong> - możesz żądać usunięcia swoich danych</li>
              <li><strong>Prawo do ograniczenia przetwarzania</strong> - możesz żądać ograniczenia przetwarzania</li>
              <li><strong>Prawo do przenoszenia danych</strong> - możesz otrzymać swoje dane w ustrukturyzowanym formacie</li>
              <li><strong>Prawo do sprzeciwu</strong> - możesz sprzeciwić się przetwarzaniu w określonych przypadkach</li>
            </ul>
          </section>

          {/* Bezpieczeństwo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Bezpieczeństwo danych</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych osobowych:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Szyfrowanie danych w spoczynku i w transporcie</li>
              <li>Regularne aktualizacje zabezpieczeń</li>
              <li>Ograniczony dostęp do danych osobowych</li>
              <li>Regularne kopie zapasowe</li>
              <li>Monitoring bezpieczeństwa</li>
            </ul>
          </section>

          {/* Pliki cookie */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Pliki cookie</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Aplikacja używa plików cookie w celu:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Zapewnienia prawidłowego działania aplikacji</li>
              <li>Zapamiętywania preferencji użytkownika</li>
              <li>Analizy ruchu w aplikacji</li>
              <li>Zapewnienia bezpieczeństwa sesji</li>
            </ul>
          </section>

          {/* Zmiany w polityce */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Zmiany w polityce prywatności</h2>
            <p className="text-gray-700 leading-relaxed">
              Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
              O wszelkich zmianach będziemy informować użytkowników poprzez aktualizację daty 
              "Ostatnia aktualizacja" na górze tej strony.
            </p>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontakt</h2>
            <p className="text-gray-700 leading-relaxed">
              W przypadku pytań dotyczących niniejszej Polityki Prywatności lub przetwarzania 
              Twoich danych osobowych, możesz skontaktować się z nami poprzez aplikację 
              lub bezpośrednio w sprawach związanych z ochroną danych osobowych.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-sm text-gray-500 text-center">
              Niniejsza Polityka Prywatności jest zgodna z Rozporządzeniem Parlamentu Europejskiego 
              i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych 
              w związku z przetwarzaniem danych osobowych (RODO).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
