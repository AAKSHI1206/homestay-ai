import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold">
          About Page
        </h1>

        <p className="mt-4">
          This is a placeholder About page for Week 2 deliverables.
        </p>
      </div>

      <Footer />
    </>
  );
}

export default About;
