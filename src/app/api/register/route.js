import { sendMail } from "@/helpers/sendMail";
import prisma from "@/lib/prismasb";
import bcrypt from "bcryptjs"


export async function registerRoute(req,res) {
  const body = req.body;
  const { email, name, password, role } = body;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  });

  sendMail({ email, userId: user.id });

}
