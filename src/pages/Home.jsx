import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
      <h1 className="text-3xl font-semibold text-stone-900 dark:text-white sm:text-4xl">
        Discover homestays, picked for you.
      </h1>
      <p className="max-w-xl text-stone-500 dark:text-stone-400">
        HomestayAI matches travelers with local stays and gives hosts a
        simple dashboard to manage bookings.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/dashboard">
          <Button>View dashboard</Button>
        </Link>
        <Link to="/about">
          <Button variant="outline">Learn more</Button>
        </Link>
      </div>
    </div>
  );
}
