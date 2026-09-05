import { HomePage } from "./components/home/HomePage";
import type {
  BrowseCategory,
  ClubFilters,
} from "./types/clubs";

function App() {
  function openCategory(
    category: BrowseCategory,
    filters: ClubFilters,
  ) {
    console.log(category, filters);
  }

  return (
    <HomePage
      onOpenCategory={openCategory}
      onCreateClub={() => {
        console.log("Open create-club page");
      }}
    />
  );
}

export default App;