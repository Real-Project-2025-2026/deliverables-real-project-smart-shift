"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f3fdf5]">

      {/* STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 bg-white shadow-sm">
        <h1 className="text-3xl font-bold text-green-600">Wallbee</h1>

        <div className="space-x-10 text-lg font-medium">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <Link href="/map" className="hover:text-green-600">Find Chargers</Link>
          <Link href="/login" className="hover:text-green-600">Login</Link>
          <Link href="/register" className="hover:text-green-600">Register</Link>
        </div>
      </nav>

      {/* MAIN SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-20">

        {/* LEFT TEXT */}
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-5xl font-bold text-green-700 leading-tight">
            Welcome to<br/>Wallbee
          </h2>

          <p className="text-gray-600 text-lg max-w-md">
            Your smart EV charging companion.<br/>
            Find, book, and start charging anywhere — quickly and effortlessly.
          </p>

          <div className="space-y-4">
            <Link href="/login">
              <button className="w-60 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg shadow">
                Login
              </button>
            </Link>

            <Link href="/register">
              <button className="w-60 border border-green-600 text-green-700 hover:bg-green-50 py-3 rounded-xl font-semibold text-lg shadow">
                Register
              </button>
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE BACKGROUND IMAGE */}
        <div className="md:w-1/2 mt-10 md:mt-0 relative h-[350px] md:h-[500px]">
          <Image
            src="/EV1.png"   // ← Tvoja pozadinska slika
            alt="Wallbee EV Illustration"
            fill
            className="object-contain md:object-cover pointer-events-none select-none"
          />
        </div>

      </div>
    </div>
  );
}
