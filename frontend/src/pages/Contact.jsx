import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-brand-dark mb-8">
        Contact Us
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        <div className="space-y-6">

          <div className="flex items-center gap-4">
            <MapPin className="text-black" />
            <span>Patna, Bihar, India</span>
          </div>

          <div className="flex items-center gap-4">
            <Phone className="text-black" />
            <span>+91 XXXXXXXXXX</span>
          </div>

          <div className="flex items-center gap-4">
            <Mail className="text-black" />
            <span>support@flare.com</span>
          </div>

        </div>

      </div>
    </div>
  );
}