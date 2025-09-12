export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-gray-800 bg-blue-50 border-t border-blue-100">
      © {new Date().getFullYear()} PlanRemontu. Wszystkie prawa zastrzeżone.
    </footer>
  );
}
