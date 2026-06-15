function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-xl">TBI Project</h1>
      <div className="space-x-4">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/login">Login</a>
      </div>
    </nav>
  );
}

export default Navbar;