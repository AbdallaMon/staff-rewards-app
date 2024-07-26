import bcrypt from "bcrypt";

export async function GET(){
    const hashedPassword = await bcrypt.hash("01127943935ASDf", 10);
    return Response.json({
        status: 200,
        password:hashedPassword
    });
}