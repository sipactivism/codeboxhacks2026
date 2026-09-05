import { useContext } from "react";

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

  function openCategory(category: BrowseCategory, filters: ClubFilters) {
    console.log(category, filters);
    setPageNum(3);
  }

  switch (pageNum) {
    case 1:
      return (
        <HomePage
          onOpenCategory={openCategory}
          onCreateClub={() => setPageNum(2)}
        />
      );
    case 2:
      return <CreatePage />;
    case 3:
      return <ClubListingsPage />;
    case 4:
      return <ClubDetail onBack={() => setPageNum(1)} />;
  }
}
