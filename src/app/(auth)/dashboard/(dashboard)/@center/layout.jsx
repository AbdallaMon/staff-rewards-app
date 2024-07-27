import {BasicTabs} from "@/app/UiComponents/DataViewer/BasicTabs";

export default function Layout({children}){

    return(
          <>
              <BasicTabs section="center" />
                {children}
          </>
    )
}