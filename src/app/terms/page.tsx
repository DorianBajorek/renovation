"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Warunki Korzystania</h1>
          <p className="text-gray-600">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Wprowadzenie */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Wprowadzenie</h2>
            <p className="text-gray-700 leading-relaxed">
              Niniejsze Warunki Korzystania ("Warunki") regulują korzystanie z aplikacji do zarządzania 
              projektami remontowymi ("Aplikacja", "Serwis"). Korzystając z Aplikacji, użytkownik 
              ("Ty", "Użytkownik") akceptuje niniejsze Warunki w całości.
            </p>
          </section>

          {/* Definicje */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definicje</h2>
            <div className="space-y-4">
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Aplikacja</strong> - aplikacja webowa do zarządzania projektami remontowymi</li>
                <li><strong>Użytkownik</strong> - osoba fizyczna korzystająca z Aplikacji</li>
                <li><strong>Konto</strong> - indywidualne konto użytkownika w Aplikacji</li>
                <li><strong>Projekt</strong> - projekt remontowy tworzony przez użytkownika</li>
                <li><strong>Treść</strong> - wszystkie dane wprowadzane przez użytkownika do Aplikacji</li>
              </ul>
            </div>
          </section>

          {/* Akceptacja warunków */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Akceptacja warunków</h2>
            <p className="text-gray-700 leading-relaxed">
              Tworząc konto w Aplikacji lub korzystając z niej w jakikolwiek sposób, 
              potwierdzasz, że przeczytałeś, zrozumiałeś i akceptujesz niniejsze Warunki. 
              Jeśli nie zgadzasz się z którymkolwiek z postanowień, nie powinieneś korzystać z Aplikacji.
            </p>
          </section>

          {/* Opis usługi */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Opis usługi</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Aplikacja umożliwia użytkownikom:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Tworzenie i zarządzanie projektami remontowymi</li>
              <li>Planowanie pokoi i pomieszczeń</li>
              <li>Wybór produktów i materiałów</li>
              <li>Udostępnianie projektów innym użytkownikom</li>
              <li>Przechowywanie danych projektowych</li>
            </ul>
          </section>

          {/* Rejestracja i konto */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Rejestracja i konto użytkownika</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Aby korzystać z pełnej funkcjonalności Aplikacji, musisz utworzyć konto użytkownika.
              </p>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-800">5.1 Wymagania dotyczące rejestracji</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Musisz mieć ukończone 18 lat lub posiadać zgodę opiekuna prawnego</li>
                  <li>Musisz podać prawdziwe i aktualne dane</li>
                  <li>Jesteś odpowiedzialny za zachowanie poufności swoich danych logowania</li>
                  <li>Jesteś odpowiedzialny za wszystkie działania wykonywane z Twojego konta</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-800">5.2 Zakazane działania</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Udostępnianie swojego konta osobom trzecim</li>
                  <li>Próby nieautoryzowanego dostępu do kont innych użytkowników</li>
                  <li>Tworzenie fałszywych kont</li>
                  <li>Używanie automatycznych skryptów do korzystania z Aplikacji</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Zawartość użytkownika */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Zawartość użytkownika</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Użytkownik zachowuje prawa do treści wprowadzanych do Aplikacji, ale udziela nam 
                licencji na ich przetwarzanie w celu świadczenia usług.
              </p>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-800">6.1 Odpowiedzialność za treść</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Jesteś odpowiedzialny za treść wprowadzaną do Aplikacji</li>
                  <li>Treść nie może naruszać praw osób trzecich</li>
                  <li>Treść nie może być nielegalna, obraźliwa lub szkodliwa</li>
                  <li>Zastrzegamy sobie prawo do usunięcia nieodpowiedniej treści</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-800">6.2 Licencja</h3>
                <p className="text-gray-700 leading-relaxed">
                  Udzielasz nam nieodpłatnej, niewyłącznej licencji na przetwarzanie Twojej treści 
                  w celu świadczenia usług Aplikacji.
                </p>
              </div>
            </div>
          </section>

          {/* Własność intelektualna */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Własność intelektualna</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Aplikacja i jej zawartość (z wyjątkiem treści użytkowników) są chronione prawami 
                autorskimi i innymi prawami własności intelektualnej.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Nie wolno kopiować, modyfikować ani rozpowszechniać Aplikacji</li>
                <li>Nie wolno używać Aplikacji do celów komercyjnych bez zgody</li>
                <li>Wszystkie znaki towarowe należą do ich właścicieli</li>
              </ul>
            </div>
          </section>

          {/* Ograniczenie odpowiedzialności */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Ograniczenie odpowiedzialności</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Aplikacja jest świadczona "w stanie obecnym" bez żadnych gwarancji.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Nie gwarantujemy nieprzerwanego działania Aplikacji</li>
                <li>Nie odpowiadamy za utratę danych użytkownika</li>
                <li>Nie odpowiadamy za szkody pośrednie wynikające z korzystania z Aplikacji</li>
                <li>Odpowiedzialność jest ograniczona do maksymalnej kwoty opłaconej za usługę</li>
              </ul>
            </div>
          </section>

          {/* Prywatność */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prywatność</h2>
            <p className="text-gray-700 leading-relaxed">
              Ochrona Twojej prywatności jest dla nas ważna. Szczegółowe informacje o tym, 
              jak zbieramy, używamy i chronimy Twoje dane osobowe, znajdziesz w naszej 
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700 mx-1">Polityce Prywatności</Link>.
            </p>
          </section>

          {/* Zmiany w warunkach */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Zmiany w warunkach</h2>
            <p className="text-gray-700 leading-relaxed">
              Zastrzegamy sobie prawo do zmiany niniejszych Warunków w dowolnym czasie. 
              O zmianach będziemy informować użytkowników poprzez aktualizację daty 
              "Ostatnia aktualizacja" na górze tej strony. Kontynuowanie korzystania 
              z Aplikacji po wprowadzeniu zmian oznacza akceptację nowych Warunków.
            </p>
          </section>

          {/* Rozwiązanie umowy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Rozwiązanie umowy</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Umowa może zostać rozwiązana w następujących przypadkach:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Przez użytkownika - poprzez usunięcie konta</li>
                <li>Przez nas - w przypadku naruszenia Warunków</li>
                <li>Automatycznie - po okresie braku aktywności</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Po rozwiązaniu umowy Twoje dane mogą zostać usunięte zgodnie z naszą Polityką Prywatności.
              </p>
            </div>
          </section>

          {/* Prawo właściwe */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Prawo właściwe</h2>
            <p className="text-gray-700 leading-relaxed">
              Niniejsze Warunki są regulowane prawem polskim. Wszelkie spory będą rozstrzygane 
              przez właściwe sądy w Polsce, chyba że przepisy prawa stanowią inaczej.
            </p>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Kontakt</h2>
            <p className="text-gray-700 leading-relaxed">
              W przypadku pytań dotyczących niniejszych Warunków Korzystania możesz 
              skontaktować się z nami poprzez Aplikację lub bezpośrednio.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-sm text-gray-500 text-center">
              Niniejsze Warunki Korzystania wchodzą w życie z dniem publikacji i obowiązują 
              wszystkich użytkowników Aplikacji do zarządzania projektami remontowymi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
