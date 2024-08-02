import bcrypt from "bcrypt";

export async function GET() {
    const hashedPassword = await bcrypt.hash("Moe@#01022923659", 10);
    return Response.json({
        status: 200,
        password: hashedPassword
    });
}