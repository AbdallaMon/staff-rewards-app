import { toast } from "react-toastify";
import { Failed, Success } from "@/app/UiComponents/ToastUpdate/ToastUpdate";
import {url} from "@/app/constants";

export async function handleRequestSubmit(
  data,
  setLoading,
  path,
  isFileUpload = false,
  toastMessage = "Sending...",
  setRedirect,method="POST"
) {
  const toastId = toast.loading(toastMessage);
  const body = isFileUpload ? data : JSON.stringify(data);
  const headers = isFileUpload ? {} : { "Content-Type": "application/json" };
  setLoading(true);
  const id = toastId;
  try {
    const request = await fetch(url+"/api/" + path, {
      method: method,
      body,
      headers: headers,
    });
    const response = await request.json();
    if (response.status === 200) {
      await toast.update(id, Success(response.message));
      if (setRedirect) {
        setRedirect((prev) => !prev);
      }
    } else {
      toast.update(id, Failed(response.message));
    }
    return response;
  } catch (err) {
    toast.update(id, Failed("Error, " + err.message));
    return { status: 500, message: "Error, " + err.message };
  } finally {
    setLoading(false);
  }
}
