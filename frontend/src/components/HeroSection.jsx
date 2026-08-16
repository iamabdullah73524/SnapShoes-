import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-[#f7dde5] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="rounded-[2rem] bg-white border border-[#ebd3da] p-10 lg:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.08)]">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#b94f75] mb-6 inline-block">
            NIKE DUNK LOW
          </span>
          <h1 className="text-5xl md:text-[5.5rem] font-black uppercase leading-tight tracking-[-0.04em] text-[#151515]">
            JUST <span className="text-[#b94f75]">DO IT.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm md:text-base leading-7 text-[#5b5b5b]">
            Soft pink edition with sculptural lines and premium performance styling. A modern take on iconic Nike silhouette for street and studio.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-full bg-[#151515] px-8 py-3 text-xs font-black uppercase tracking-[0.35em] text-white transition hover:bg-[#b94f75]"
            >
              Order Now
              <ChevronRight size={16} className="ml-2" />
            </Link>
            <div className="text-sm font-semibold text-[#5b5b5b]">
              36 - 42
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#a18f9b] mt-1">Size Available</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#221717] p-10 lg:p-16">
          <div className="absolute inset-y-0 right-0 w-20 bg-[#b94f75]/10"></div>
          <div className="absolute top-8 left-8 text-xs uppercase tracking-[0.35em] text-white/40">
            NIKE
          </div>
          <img
            src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa"
            alt="Nike Dunk Low Soft Pink"
            className="relative mx-auto h-[340px] w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
