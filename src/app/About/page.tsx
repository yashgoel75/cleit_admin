import Footer from "../Footer/page";
import Header from "../Header/page";
import "./page.css";
import logo from "@/assets/cleitVips.png";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Header></Header>
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4 onest-normal">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6">
          About Us
        </h2>
        <div className="flex justify-center items-center">
          <Image src={logo} width={400} alt="Cleit x VIPS"></Image>
        </div>
        <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
          As a third-year student at&nbsp;
          <span className="font-medium">
            Vivekananda Institute of Professional Studies
          </span>
          , I found it strange — and a little frustrating — that I only knew 2
          or 3 societies by name. Even after years on campus, most students feel
          disconnected from the cultural heart of college: the societies.
        </p>

        <div className="h-6" />

        <p className="text-lg text-gray-800">
          I remembered my first year — having&nbsp;
          <span className="bg-indigo-100 px-1 rounded-md text-gray-900">
            no clue where to find society info, how to apply, or when auditions
            were happening.
          </span>
          That feeling stuck with me. So I built what I wished I had.
        </p>

        <div className="h-6" />

        <p className="text-lg text-gray-800">
          <span className="bg-indigo-100 px-1 rounded-md text-gray-900">
            Cleit brings all societies into one clean, connected space.
          </span>
          You can view past, ongoing, and upcoming events, check audition dates,
          eligibility, contact details, and even wishlist societies to come back
          to later. You&apos;ll never miss what matters again.
        </p>

        <div className="h-6" />

        <p className="text-lg text-gray-800">
          The experience is designed to feel like home — calm, intuitive, and
          personal. You shouldn&apos;t have to chase information. It should come
          to you.
        </p>

        <div className="h-6" />

        <p className="text-lg text-gray-800">
          Right now, Cleit is focused on VIPS. But the vision is bigger — to
          build a platform that helps college students across the country feel
          <span className="text-indigo-600 font-medium">
            &nbsp; seen, connected, and involved.
          </span>
        </p>
      </main>
      <Footer></Footer>
    </>
  );
}
