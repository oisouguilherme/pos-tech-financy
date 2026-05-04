import bcrypt from "bcryptjs";
import crypto from "crypto";
import { GraphQLError } from "graphql";
import { prisma } from "../../utils/prisma";
import { signToken } from "../../utils/jwt";
import { GraphQLContext } from "../../middleware/auth";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export const authResolvers = {
  Mutation: {
    async register(_: unknown, { input }: { input: RegisterInput }) {
      const { name, email, password } = input;

      if (!name?.trim()) {
        throw new GraphQLError("Name is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (!EMAIL_REGEX.test(email)) {
        throw new GraphQLError("Invalid email address", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new GraphQLError(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existing) {
        throw new GraphQLError("Email already in use", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      });

      const token = signToken(user.id);
      return { token, user };
    },

    async login(_: unknown, { input }: { input: LoginInput }) {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const token = signToken(user.id);
      return { token, user };
    },

    async forgotPassword(_: unknown, { email }: { email: string }) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Do not reveal whether the email exists
      if (!user) {
        return {
          message:
            "If an account with this email exists, a reset token has been issued.",
          resetToken: "",
        };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashedToken, resetTokenExpiry: expiry },
      });

      return {
        message: "Reset token generated. Use it within 1 hour.",
        resetToken, // raw token returned for dev/test; in production, send via email
      };
    },

    async resetPassword(
      _: unknown,
      { token, newPassword }: { token: string; newPassword: string },
    ) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new GraphQLError(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        throw new GraphQLError("Invalid or expired reset token", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return true;
    },
  },
};
