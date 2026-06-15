import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <div className="flex flex-wrap justify-center gap-6 p-8">
        <Card
          title="AI Development"
          description="Placeholder content for AI Development."
          image="https://via.placeholder.com/300"
          action="Learn More"
        />

        <Card
          title="Full Stack Development"
          description="Placeholder content for Full Stack Development."
          image="https://via.placeholder.com/300"
          action="Explore"
        />
      </div>

      <Footer />
    </>
  );
}

export default Home;
