import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { AppHeader } from "./components/AppHeader/AppHeader";
import { ClubDetail } from "./components/ClubDetail/ClubDetail";
import ClubListingsPage, { clubFromRow } from "./components/clubview/ClubListingsPage";
import type { Club } from "./components/clubview/ClubListingsPage";
import CreatePage from "./components/createpage/createpage";
import { HomePage } from "./components/home/HomePage";
import { RandomizeButton } from "./components/RandomizeButton/RandomizeButton";
import { PageContext, PageProvider } from "./PageContext";
import type { BrowseCategory, ClubFilters } from "./types/clubs";
import { getApprovedClubRows } from "./utils/approvedClubs";

const CATEGORY_SEARCH_TERMS: Partial<Record<BrowseCategory, string>> = {
  sports: "#sport",
  arts: "#art",
  culture: "#culture",
  fun: "#fun",
  academic: "#academic",
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
  const pageHistory = useRef<number[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [filters, setFilters] = useState<ClubFilters>({
    query: "",
    commitment: "all",
    minimumRating: 0,
  });
  const [randomCategory, setRandomCategory] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0);

  useEffect(() => {
    // Start the directory request while the user is still on the home page.
    void getApprovedClubRows().catch(() => undefined);
  }, []);

  const navigateTo = useCallback((nextPage: number) => {
    pageHistory.current.push(pageNum);
    setPageNum(nextPage);
  }, [pageNum, setPageNum]);

  const goBack = useCallback(() => {
    setPageNum(pageHistory.current.pop() ?? 1);
  }, [setPageNum]);

  function openCategory(category: BrowseCategory, currentFilters: ClubFilters) {
    setRandomCategory(false);
    setFilters(
      CATEGORY_SEARCH_TERMS[category]
        ? { ...currentFilters, query: CATEGORY_SEARCH_TERMS[category] }
        : currentFilters,
    );
    navigateTo(3);
  }

  async function randomizeClubs() {
    try {
      const rows = await getApprovedClubRows();
      if (rows.length > 0) {
        const randomClub = clubFromRow(rows[Math.floor(Math.random() * rows.length)]);
        setRandomCategory(false);
        setSelectedClub(randomClub);
        navigateTo(4);
        return;
      }
    } catch {
      // Fall through to the randomized-list view, which handles its own error state.
    }

    // Preserve the existing randomized-list view as a fallback if the request fails.
    setRandomCategory(true);
    setRandomSeed((seed) => seed + 1);
    setFilters({ ...filters, query: "" });
    navigateTo(3);
  }

  function openCreateClub() {
    setRandomCategory(false);
    navigateTo(2);
  }

  function openClub(club: Club) {
    setRandomCategory(false);
    setSelectedClub(club);
    navigateTo(4);
  }

  let page;

  switch (pageNum) {
    case 1:
      page = (
        <HomePage
          filters={filters}
          onFiltersChange={setFilters}
          onOpenCategory={openCategory}
          onCreateClub={openCreateClub}
        />
      );
      break;
    case 2:
      page = <CreatePage />;
      break;
    case 3:
      page = (
        <ClubListingsPage
          filters={filters}
          onFiltersChange={setFilters}
          randomCategory={randomCategory}
          randomSeed={randomSeed}
          onClubClick={openClub}
        />
      );
      break;
    case 4:
      page = <ClubDetail club={selectedClub ?? undefined} />;
      break;
    default:
      page = (
        <HomePage
          filters={filters}
          onFiltersChange={setFilters}
          onOpenCategory={openCategory}
          onCreateClub={openCreateClub}
        />
      );
  }

  return (
    <>
      <AppHeader canGoBack={pageNum !== 1 && pageHistory.current.length > 0} onBack={goBack} />
      {page}
      <RandomizeButton onClick={randomizeClubs} />
    </>
  );
}
