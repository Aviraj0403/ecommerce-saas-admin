import Link from 'next/link'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Hero } from '@/components/home/Hero'
import { Categories } from '@/components/home/Categories'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Categories />
      <FeaturedProducts />
      
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Collection</h2>
          <p className="text-gray-600">Discover our curated collections</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/products?filter=new" className="group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white h-64 flex flex-col justify-end hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold mb-2">New Arrivals</h3>
              <p className="text-blue-100">Fresh products just for you</p>
            </div>
          </Link>
          
          <Link href="/products?filter=bestseller" className="group">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white h-64 flex flex-col justify-end hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold mb-2">Best Sellers</h3>
              <p className="text-orange-100">Most loved by customers</p>
            </div>
          </Link>
          
          <Link href="/products?filter=featured" className="group">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white h-64 flex flex-col justify-end hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold mb-2">Featured</h3>
              <p className="text-green-100">Handpicked selections</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
