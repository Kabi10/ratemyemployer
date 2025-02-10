export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-blue-600 text-white">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Rate My Employer
            </h1>
            <p className="text-xl mb-8">
              Share your work experiences anonymously
            </p>
            {/* Search Bar Component */}
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Rest of page content */}
    </main>
  );
}
