import { useContext, useState } from "react";

import { ClubDetail } from "./components/ClubDetail/ClubDetail";
import ClubListingsPage, { clubFromRow } from "./components/clubview/ClubListingsPage";
import type { Club } from "./components/clubview/ClubListingsPage";
import CreatePage from "./components/createpage/createpage";
import { HomePage } from "./components/home/HomePage";
import { RandomizeButton } from "./components/RandomizeButton/RandomizeButton";
import { PageContext, PageProvider } from "./PageContext";
import type { BrowseCategory, ClubFilters } from "./types/clubs";
import { supabase } from "./utils/supabase";

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
  const [randomSeed, setRandomSeed] = useState(0);

  function openCategory(category: BrowseCategory, currentFilters: ClubFilters) {
    setRandomCategory(false);
    setFilters(
      CATEGORY_SEARCH_TERMS[category]
        ? { ...currentFilters, query: CATEGORY_SEARCH_TERMS[category] }
        : currentFilters,
    );
    setPageNum(3);
  }

  async function randomizeClubs() {
    const { data, error } = await supabase
      .schema("public")
      .from("clubs")
      .select("id, name, description, image, club_statistics, tags, contact_links")
      .eq("approved", true);

    if (!error && data && data.length > 0) {
      const randomClub = clubFromRow(data[Math.floor(Math.random() * data.length)]);
      setRandomCategory(false);
      setSelectedClub(randomClub);
      setPageNum(4);
      return;
    }

    // Preserve the existing randomized-list view as a fallback if the request fails.
    setRandomCategory(true);
    setRandomSeed((seed) => seed + 1);
    setFilters({ ...filters, query: "" });
    setPageNum(3);
  }

  function openCreateClub() {
    setRandomCategory(false);
    setPageNum(2);
  }

  function openClub(club: Club) {
    setRandomCategory(false);
    setSelectedClub(club);
    setPageNum(4);
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
      page = <ClubDetail club={selectedClub ?? undefined} onBack={() => setPageNum(3)} />;
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
      {page}
      <RandomizeButton onClick={randomizeClubs} />
    </>
  );
}
