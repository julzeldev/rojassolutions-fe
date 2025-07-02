import rsLogo from "../../assets/rs-logo.png";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1
            className="font-bold text-3xl text-gray-800 dark:text-gray-100"
          >Rojas Solutions Portal</h1>
           <img
              width={300}
              src={rsLogo}
              alt="Rojas Solutions Net"
            />
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4 text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            Sitio en construcción
          </p>
        </div>
      </div>
    </main>
  );
}
