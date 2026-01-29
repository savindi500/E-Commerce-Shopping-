import React from "react";
import { FaLeaf, FaAward, FaShippingFast, FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <section className="pt-32 py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            LIARA <span className="text-gray-500"></span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Minimalist fashion for the conscious individual
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-px bg-black"></div>
          </div>
        </motion.div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-black">
              OUR PHILOSOPHY
            </h2>
            <p className="text-lg mb-6 text-gray-600">
              Founded in 2015, Liara emerged from a simple idea: clothing should
              be effortless, timeless, and made to last. We reject fast fashion
              in favor of considered designs that transcend seasons.
            </p>
            <p className="text-lg text-gray-600">
              Each piece is crafted from premium natural fabrics, with attention
              to precise tailoring and functional details. Our monochromatic
              palette ensures effortless coordination and enduring style.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-100 h-96 rounded-lg flex items-center justify-center"
          >
            <span className="text-5xl font-light tracking-widest text-gray-400">
              LIARA
            </span>
          </motion.div>
        </div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-50 rounded-lg p-8 md:p-12 mb-20 border-l-4 border-black"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-black">
            OUR APPROACH
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-px bg-black"></div>
          </div>
          <p className="text-xl text-center max-w-4xl mx-auto text-gray-600 italic">
            "We believe in fewer, better things. Each Liara garment is designed
            to become a permanent part of your wardrobe, eliminating the need
            for constant replacement."
          </p>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center text-black">
            OUR PRINCIPLES
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaLeaf className="text-4xl mb-4 text-black" />,
                title: "SUSTAINABILITY",
                description:
                  "Organic cotton, linen, and responsible wool sourcing",
              },
              {
                icon: <FaAward className="text-4xl mb-4 text-black" />,
                title: "CRAFTSMANSHIP",
                description: "Garments constructed to withstand years of wear",
              },
              {
                icon: <FaShippingFast className="text-4xl mb-4 text-black" />,
                title: "ETHICAL PRODUCTION",
                description: "Partnering with certified fair-wage facilities",
              },
              {
                icon: <FaHeadset className="text-4xl mb-4 text-black" />,
                title: "CONSCIOUS SERVICE",
                description:
                  "Expert styling advice for building a capsule wardrobe",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-black transition-all duration-300"
              >
                <div className="text-center">
                  {value.icon}
                  <h3 className="text-xl font-semibold mb-3 uppercase tracking-wider text-black">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Materials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center text-black">
            MATERIAL INTEGRITY
          </h2>
          <div className="grid gap-12">
            {[
              {
                title: "ORGANIC COTTON",
                description:
                  "Grown without synthetic pesticides, softer with each wash",
                percentage: "100%",
              },
              {
                title: "LINEN",
                description:
                  "Naturally temperature-regulating and biodegradable",
                percentage: "100%",
              },
              {
                title: "RECYCLED WOOL",
                description:
                  "Repurposed fibers maintaining warmth and durability",
                percentage: "85%",
              },
            ].map((material, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-medium text-black">
                    {material.title}
                  </h3>
                  <span className="text-2xl font-light text-gray-500">
                    {material.percentage}
                  </span>
                </div>
                <p className="text-gray-600">{material.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-20 border border-black rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
            JOIN OUR JOURNEY
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto text-gray-600">
            Discover thoughtful fashion designed to last
          </p>
          
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
