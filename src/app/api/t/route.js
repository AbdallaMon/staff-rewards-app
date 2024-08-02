import deleteFileFromUrl from "@/app/api/utlis/deleteAFile";

export async function GET() {
    await deleteFileFromUrl()
    return Response.json({status: 200})
}