import bcrypt from "bcryptjs";
import { SMTPClient } from "emailjs";

const client = new SMTPClient({
  user: process.env.SMTP_MAIL,
  password: process.env.SMTP_PASSWORD,
  host: process.env.SMTP_HOST,
  ssl: true,
});

export const sendMail = async ({ email, userId }) => {
  const hashedToken = await bcrypt.hash(userId, 10);
  const updateData = {
    verifyToken: hashedToken,
    //for 1 hour
    verifyTokenExpiry: new Date().getTime() + 3600000,
  };

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });

  let message = {
    text: `Click the following link to verify your email: ${process.env.NEXT_PUBLIC_BASE_URL}/verifyemail?token=${hashedToken}`,
    from: "thexpresssalon@gmail.com",
    to: email,
    subject: "Verify Your Email",
  };

  try {
    await client.sendAsync(message);
  } catch (error) {
    throw new Error("Error sending email: ", error);
  }
};
