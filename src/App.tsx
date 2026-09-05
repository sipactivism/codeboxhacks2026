import { useContext, useState } from "react";

import { ClubDetail } from "./components/ClubDetail/ClubDetail";
import ClubListingsPage from "./components/clubview/ClubListingsPage";
import CreatePage from "./components/createpage/createpage";
import { HomePage } from "./components/home/HomePage";
import { PageContext, PageProvider } from "./PageContext";
import type { BrowseCategory, ClubFilters } from "./types/clubs";

function App() {
  return (
    <PageProvider>
      <PageContainer />
    </PageProvider>
  );
}

export default App;

function PageContainer() {
  const { pageNum, setPageNum } = useContext(PageContext);
  const [filters, setFilters] = useState<ClubFilters>({
    query: "",
    commitment: "all",
    minimumRating: 0,
  });

  function openCategory(_category: BrowseCategory, filters: ClubFilters) {
    setFilters(filters);
    setPageNum(3);
  }

  switch (pageNum) {
    case 1:
      return (
        <HomePage
          filters={filters}
          onFiltersChange={setFilters}
          onOpenCategory={openCategory}
          onCreateClub={() => setPageNum(2)}
        />
      );
    case 2:
      return <CreatePage />;
    case 3:
      return <ClubListingsPage filters={filters} onFiltersChange={setFilters} />;
    case 4:
      return <ClubDetail onBack={() => setPageNum(1)} />;
  }
}
