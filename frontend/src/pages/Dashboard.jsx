import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold">
          Dashboard Page
        </h1>

        <p className="mt-4">
          This is a placeholder Dashboard page for Week 2 deliverables.
        </p>
      </div>

      <Footer />
    </>
  );
}

export default Dashboard;
