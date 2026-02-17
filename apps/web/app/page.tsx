import { Hero } from "@/components/hero";
import FileUpload from "@/components/file-upload";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 pb-20">
      <Hero />

      <section id="upload" className="container max-w-4xl scroll-mt-20">
        <div className="rounded-3xl border border-border/50 bg-background/50 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Ready to convert?</h2>
            <p className="text-muted-foreground">Drag and drop your files below to get started.</p>
          </div>
          <FileUpload />
        </div>
      </section>

      {/* Additional Sections (Pricing, FAQ, etc) could go here */}
    </div>
  );
}
