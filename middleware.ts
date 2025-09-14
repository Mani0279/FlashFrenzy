// middleware.ts (create this file in your project root)
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    // Protect these routes
    "/lobby/:path*",
    "/match/:path*", 
    "/history/:path*"
  ]
}