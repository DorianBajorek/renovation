import { Sofa, FileText, Download, Plus } from "lucide-react";

const salonProducts = [
  { name: "Sofa narożna", icon: Sofa, price: 850 },
  { name: "Stolik kawowy", icon: FileText, price: 200 },
  { name: "Lampa stojąca", icon: FileText, price: 150 },
  { name: "Dywan", icon: FileText, price: 100 },
];

export default function SalonPage() {
  const totalPrice = salonProducts.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex flex-col">
      
      {/* Nagłówek */}
      <div className="flex justify-center py-10 px-6">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-lg border border-white/30">
          <Sofa size={32} className="text-black" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Produkty w salonie
          </h1>
        </div>
      </div>

      {/* Pasek podsumowania */}
      <div className="px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-slate-700 mb-2">Łączna wartość produktów</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-slate-900">{totalPrice} PLN</span>
              <span className="text-sm text-slate-500">dla {salonProducts.length} produktów</span>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
            <Download size={18} />
            <span>Eksportuj listę</span>
          </button>
        </div>
      </div>

      {/* Lista produktów */}
      <main className="flex-1 px-6 md:px-12 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {salonProducts.map((product, idx) => {
            const Icon = product.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 flex items-center gap-4"
              >
                <div className="p-4 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={36} strokeWidth={1.5} className="text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <span className="text-slate-600 font-medium">{product.price} PLN</span>
                </div>
                <button className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors">
                  Szczegóły
                </button>
              </div>
            );
          })}

          {/* Dodaj produkt */}
          <div className="group p-6 rounded-3xl border-2 border-dashed border-slate-300/70 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center gap-5 bg-white/50 backdrop-blur-md hover:bg-white/70 cursor-pointer">
            <div className="p-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <Plus size={36} strokeWidth={1.5} className="text-black" />
            </div>
            <h2 className="text-lg font-medium text-slate-500 group-hover:text-indigo-600 text-center transition-colors">
              Dodaj produkt
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
}
