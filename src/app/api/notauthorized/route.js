export async function GET() {
    return Response.json({status: 401, message: "You are not authorized to access this page"})
}