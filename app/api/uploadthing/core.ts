import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Authentication is handled by middleware, so if we reach here user is authenticated
      // We return an empty object since we don't track individual user uploads by ID
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete");
      console.log("file url", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
