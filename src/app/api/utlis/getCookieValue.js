import {cookies} from "next/headers";

export function getCookieValue(coolieName){
    const cookieStore = cookies();
        return  cookieStore.get(coolieName)?.value;
}