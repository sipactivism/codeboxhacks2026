import { useContext, useState } from "react";

import { ClubDetail } from "./components/ClubDetail/ClubDetail";
import ClubListingsPage from "./components/clubview/ClubListingsPage";
import type { Club } from "./components/clubview/ClubListingsPage";
import CreatePage from "./components/createpage/createpage";
import { HomePage } from "./components/home/HomePage";
import { PageContext, PageProvider } from "./PageContext";
import type { BrowseCategory, ClubFilters } from "./types/clubs";

const CATEGORY_SEARCH_TERMS: Partial<Record<BrowseCategory, string>> = {
  sports: "#sport",
  arts: "#art",
  culture: "#culture",
  fun: "#fun",
};

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
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [filters, setFilters] = useState<ClubFilters>({
    query: "",
    commitment: "all",
    minimumRating: 0,
  });
  const [randomCategory, setRandomCategory] = useState(false);

  function openCategory(category: BrowseCategory, currentFilters: ClubFilters) {
    setRandomCategory(category === "random");
    setFilters(
      category === "random"
        ? { ...currentFilters, query: "" }
        : CATEGORY_SEARCH_TERMS[category]
          ? { ...currentFilters, query: CATEGORY_SEARCH_TERMS[category] }
          : currentFilters,
    );
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
      return (
        <ClubListingsPage
          filters={filters}
          onFiltersChange={setFilters}
          randomCategory={randomCategory}
          onClubClick={(club) => {
            setSelectedClub(club);
            setPageNum(4);
          }}
        />
      );
    case 4:
      return <ClubDetail club={selectedClub ?? undefined} onBack={() => setPageNum(3)} />;
    default:
      return (
        <HomePage
          filters={filters}
          onFiltersChange={setFilters}
          onOpenCategory={openCategory}
          onCreateClub={() => setPageNum(2)}
        />
      );
  }
}
