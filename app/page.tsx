import HeroBanner from "@/components/hero-banner"
import PopularProducts from "@/components/popular-products"
import CategorySection from "@/components/category-section"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories Section */}
      <CategorySection />

      {/* Popular Products Section */}
      <PopularProducts />
    </main>
  )
}
