// import prisma from "@/lib/pirsma/prisma";
// import parseFormData from "@/app/api/utlis/parseFormData";
// import {getEmployeeById, updateEmployee} from "@/app/api/services/employes";
// import deleteFileFromPath from "@/app/api/utlis/deleteAFile";
// import {Buffer} from "buffer";
// import {handlePrismaError} from "@/app/api/utlis/prismaError";
//
export async function GET() {
    return Response.json({data: "want malek?"})
}

// export async function GET() {
//
//     const users = await prisma.user.findMany({
//         where: {
//             signature: {
//                 not: null,
//             },
//             bankApprovalAttachment: null,
//
//         },
//         include: {
//             duty: true,
//             center: true
//         }
//     });
//     // here loop over all users
//     const usersWithSignature = await Promise.all(
//           users.map(async (user) => {
//               if (user.signature) {
//                   try {
//                       const signatureResponse = await fetch(user.signature);
//                       if (signatureResponse.ok) {
//                           const buffer = await signatureResponse.arrayBuffer();
//                           const base64Signature = Buffer.from(buffer).toString('base64');
//                           user.signature = `data:image/png;base64,${base64Signature}`;
//                       } else {
//                           user.signature = null;
//                       }
//                   } catch (error) {
//                       user.signature = null;  // Handle any potential error fetching signature
//                   }
//               }
//               return user;
//           })
//     );
//     return Response.json({data: usersWithSignature}, {status: 200});
// }
//
//
// export async function PUT(request, response) {
//     const id = response.params.id
//     const {uploadedUrls, deletedUrl} = await parseFormData(request, true)
//     const res = await updateEmployee(+id, uploadedUrls)
//     await deleteFileFromPath(deletedUrl)
//     return Response.json(res, {status: res.status});
// }