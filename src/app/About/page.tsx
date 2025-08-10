import Footer from "../Footer/page";
import Header from "../Header/page";
import logo from "@/assets/cleitVips.png";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="flex justify-center mb-8">
          <Image src={logo} width={280} alt="Cleit x VIPS" priority />
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Cleit is the official, college-recognized platform of&nbsp;
          <span className="font-semibold">
            Vivekananda Institute of Professional Studies
          </span>
          &nbsp; that connects students with every society and event on campus.
        </p>

        <p className="text-lg leading-relaxed mb-6">
          We noticed a gap — many students, even after years at VIPS, didn’t
          know about the range of societies or when important events were
          happening. Cleit solves that by bringing&nbsp;
          <span className="font-medium text-indigo-600">
            all society information into one simple, accessible space.
          </span>
        </p>

        <p className="text-lg leading-relaxed mb-6">
          From upcoming events to audition details, eligibility, contact
          information, and more — everything is updated and organized so you
          never miss an opportunity to participate, connect, and grow.
        </p>

        <p className="text-lg leading-relaxed">
          Today, Cleit serves VIPS, but our vision is bigger — to create a
          nationwide network where college life feels&nbsp;
          <span className="font-medium text-indigo-600">
            connected, engaging, and inspiring
          </span>
          &nbsp; for every student.
        </p>
      </main>
      <Footer />
    </>
  );
}
