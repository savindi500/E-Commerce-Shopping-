import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Star,
  Heart,
  Truck,
  Shield,
  Award,
  Clock,
  Instagram,
} from "lucide-react";

// Import sample images (replace with your actual image paths)
import heroImage1 from "../assets/women.png";
import heroImage2 from "../assets/women9.jpg";
import heroImage3 from "../assets/women8.jpg";
import heroImage4 from "../assets/hero3.jpg";
import womenWear from "../assets/women10.jpg";
import menWear from "../assets/men.jpg";
import kidsWear from "../assets/kids.jpg";

import insta1 from "../assets/girlsjpg.jpg";
import insta2 from "../assets/boy.jpg";
import insta3 from "../assets/girls2.jpg";
import insta4 from "../assets/boy2jpg.jpg";

const Herosection: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with improved image display */}
      <section className="  text-white h-screen min-h-[800px] max-h-[1000px]">
        {/* Background images container */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Fashion model ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />
            </div>
          ))}
          {/* Gradient overlay - reduced opacity to show more of the image */}
          <div className="absolute inset-0 bg-gradient-to-t "></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <div className="text-center max-w-4xl">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-8">
              <span>✨ New Arrivals</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              LET'S EXPLORE UNIQUE CLOTHES.
            </h1>

            <p className="text-xl md:text-2xl mb-8 opacity-90">
              New Collection 2025
            </p>

            
          </div>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories with direct links */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Discover our collections for every style
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/women?category=3" className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] h-96">
                <img
                  src={womenWear}
                  alt="Women's wear"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Women's Wear
                  </h3>
                  <p className="text-white/90 mb-4">Elegant & Stylish</p>
                  <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-white">Shop Now</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/men?category=2" className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] h-96">
                <img
                  src={menWear}
                  alt="Men's wear"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Men's Wear
                  </h3>
                  <p className="text-white/90 mb-4">Classic & Modern</p>
                  <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-white">Shop Now</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/kids?category=4" className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] h-96">
                <img
                  src={kidsWear}
                  alt="Kids' wear"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Kids' Wear
                  </h3>
                  <p className="text-white/90 mb-4">Fun & Comfortable</p>
                  <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-white">Shop Now</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Gallery - Updated with more images and animations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 text-pink-600 mb-4">
              <Instagram className="w-6 h-6" />
              <span className="font-semibold">@liyarafashion</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Follow Us On Instagram
            </h2>
            <p className="text-xl text-gray-600">
              Tag us to be featured #liyarastyle
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[insta1, insta2, insta3, insta4, insta1, insta2].map(
              (image, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-lg aspect-square"
                >
                  <img
                    src={image}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-pink-600 opacity-75"></div>
                    <Instagram className="w-8 h-8 text-white relative z-10 transform group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://instagram.com/liyarafashion"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 animate-bounce hover:animate-none"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Herosection;
