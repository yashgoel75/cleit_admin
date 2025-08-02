import "../page.css";
import Header from "../../Header/page";

export default function Account() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-indigo-600">
            🚧 Under Construction
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl mb-8">
            We're working on something amazing for your events page.
            <br />
            Come back soon to see what's brewing!
          </p>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-solid"></div>
          </div>
        </div>
      </main>
    </>
  );
}
