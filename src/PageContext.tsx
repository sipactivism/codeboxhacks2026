import { createContext, useState } from "react";

export const PageContext = createContext({pageNum: 1, setPageNum: (_page: number) => {}});
export function PageProvider({children}: any)
{
    const [pageNum, setPageNum] = useState(1);
    return (<PageContext.Provider value={{pageNum, setPageNum}}>{children}</PageContext.Provider>)
}