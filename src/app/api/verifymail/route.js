import prisma from "@/lib/prismasb";

export async function POST(req, res) {
  try {
    const reqBody = await request.json();
    const { token } = reqBody;

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verifyToken: null,
        verifyTokenExpires: null,
      },
    });

    return res.status(200).json({ message: "Email verified", success: true });
  } catch (error) {
    throw new Error(error);
  }
}
