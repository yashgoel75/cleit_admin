import "./page.css";
import Header from "@/app/Header/page";
import Footer from "../Footer/page";

export default function releasenotes() {
  return (
    <>
      <Header></Header>
      <div className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-20 px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Release Notes
        </h2>
        <div className="text-2xl font-semibold">v1.0.0</div>
        <div className="border-b border-gray-300"></div>
      </div>
      <Footer />
    </>
  );
}
