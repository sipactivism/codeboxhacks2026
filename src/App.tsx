import { useContext } from "react";
import CreatePage from "./components/createpage/createpage";
import { HomePage } from "./components/home/HomePage";
import { PageContext, PageProvider } from "./PageContext";
import type {
  BrowseCategory,
  ClubFilters,
} from "./types/clubs";

function App() {

  return (
    <PageProvider>
      <PageContainer />
    </PageProvider>
  );
}

export default App;

function PageContainer()
{
   function openCategory(
    category: BrowseCategory,
    filters: ClubFilters,
  ) {
    console.log(category, filters);
  }

  const {pageNum, setPageNum} = useContext(PageContext);
  switch(pageNum){
    case 1: return (
    <HomePage
      onOpenCategory={openCategory}
      onCreateClub={() => {
        setPageNum(2);
      }}
    />);
    case 2: return (<CreatePage></CreatePage>);
  }
}
