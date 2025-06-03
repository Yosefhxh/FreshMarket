import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-16 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-20 h-20 bg-emerald-300 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-green-300 rounded-full opacity-20"></div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto h-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full items-center gap-12 px-6">
          {/* Lado izquierdo - Texto */}
          <div className="space-y-8 max-w-xl">
            {/* Badge de oferta especial */}
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
              <Star className="w-4 h-4 fill-current" />
              ¡Oferta Especial!
            </div>

            {/* Título principal con mejor espaciado */}
            <div className="relative">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-green-700 leading-tight mb-6">
                GRAN
                <br />
                <span className="text-green-600">OFERTA</span>
              </h1>

              {/* Badge de descuento posicionado mejor */}
              <div className="absolute -top-6 -right-4 lg:-right-8 bg-red-500 text-white rounded-full w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center transform rotate-12 shadow-xl z-10">
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold">50%</div>
                  <div className="text-xs font-bold">DESC</div>
                </div>
              </div>
            </div>

            {/* Subtítulo con mejor espaciado */}
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700">Productos frescos y naturales</h2>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Descubre nuestra selección de productos orgánicos, frutas frescas y verduras de la mejor calidad para tu
                familia.
              </p>
            </div>

            {/* Botones con mejor espaciado */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="#productos">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Comprar Ahora
                </Button>
              </Link>
              <Link href="#categorias">
                <Button
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg rounded-full transition-all duration-300 w-full sm:w-auto"
                >
                  Ver Categorías
                </Button>
              </Link>
            </div>

            {/* Estadísticas con mejor espaciado */}
            <div className="flex justify-start gap-12 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600 mt-1">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 mt-1">Fresco</div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Imagen */}
          <div className="relative h-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-xl">
              {/* Efecto de fondo para la imagen */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-10 blur-3xl scale-110"></div>

              {/* Imagen principal */}
              <div className="relative z-10">
                <Image
                  src="/images/hero-banner.png"
                  alt="Productos frescos y verduras"
                  width={700}
                  height={500}
                  className="object-contain drop-shadow-2xl w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de navegación mejorados */}
      <Button
        variant="ghost"
        className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/95 backdrop-blur-sm shadow-xl hover:bg-white hover:shadow-2xl p-0 transition-all duration-300"
      >
        <ChevronLeft className="h-7 w-7 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/95 backdrop-blur-sm shadow-xl hover:bg-white hover:shadow-2xl p-0 transition-all duration-300"
      >
        <ChevronRight className="h-7 w-7 text-green-600" />
      </Button>
    </div>
  )
}
