import { useEffect, useRef } from "react";
import template from "@/assets/template.txt?raw";
import { $typst } from "@myriaddreamin/typst.ts";

$typst.setCompilerInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
});

$typst.setRendererInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
});

export function ResumePreview({ fullName }: { fullName: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const render = (content: string) => {
    if (!ref.current) return;
    $typst
      .svg({
        mainContent: content,
      })
      .then((svg) => {
        if (!ref.current) return;
        ref.current.innerHTML = svg;
      });
  };

  useEffect(() => {
    render(template.replace("%NAME%", fullName));
  }, [ref, fullName]);

  return (
    <div>
      PREVIEW
      <div ref={ref}></div>
    </div>
  );
}