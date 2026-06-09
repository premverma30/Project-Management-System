// import type { NextConfig } from "next";
// import path from "path";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "lh3.googleusercontent.com",
//         port: "",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "pm-s3-images.s3.us-east-2.amazonaws.com",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//     // Bypass Next.js image optimization proxy to avoid
//     // NAT64 private-IP resolution blocks on S3 images
//     unoptimized: true,
//   },
//   turbopack: {
//     root: path.resolve("."),
//   },
// };

// export default nextConfig;






import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pm-s3-images.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },

  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;