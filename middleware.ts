export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/painel/:path*",
    "/foco/:path*",
    "/tutor/:path*",
    "/simulado/:path*",
    "/relatorios/:path*",
    "/portugues/:path*",
    "/matematica/:path*",
    "/ingles/:path*",
    "/diagnostico/:path*",
  ],
};
