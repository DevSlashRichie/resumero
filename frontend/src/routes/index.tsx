import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import template from "@/assets/template.txt?raw";

import { $typst } from "@myriaddreamin/typst.ts";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

$typst.setCompilerInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
});

$typst.setRendererInitOptions({
  getModule: () =>
    "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm",
});

interface Education {
  uni: string;
  field: string;
  location: string;
  from: string;
  to: string;
}

interface Experience {
  role: string;
  company: string;
  location: string;
  from: string;
  to: string;
  context: string;
  descriptions: { text: string }[];
}

interface Project {
  projectName: string;
  organization: string;
  from: string;
  to: string;
  context: string;
  descriptions: { text: string }[];
}

interface Abilities {
  languages: string[];
  technologies: string[];
}

interface ResumeContent {
  fullName: string;
  email: string;
  github: string;
  linkedin: string;
  phone: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  abilities: Abilities;
}

function createTypstContent(input: ResumeContent): string {
  let next = template;
  const { education, experience, projects, abilities, ...rest } = input;

  Object.entries(rest).forEach(([key, value]) => {
    next = next.replace(`%${key.toUpperCase()}%`, value as string);
  });

  const educationString = education
    .map(
      (edu) =>
        `#edu(
institution: "${edu.uni}",
location: "${edu.location}",
dates: dates-helper(start-date: "${edu.from}", end-date: "${edu.to}"),
degree: "${edu.field}",
)`,
    )
    .join("\n\n");
  next = next.replace("%EDUCATION_SECTION%", educationString);

  const experienceString = experience
    .map(
      (exp) =>
        `#work(
title: "${exp.role}",
company: "${exp.company}",
location: "${exp.location}",
dates: dates-helper(start-date: "${exp.from}", end-date: "${exp.to}"),
)
${exp.descriptions.map((d) => `- ${d.text}`).join("\n")}`,
    )
    .join("\n\n");
  next = next.replace("%WORK_EXPERIENCE_SECTION%", experienceString);

  const projectsString = projects
    .map(
      (proj) =>
        `#project(
name: "${proj.projectName}",
role: "${proj.organization}",
dates: dates-helper(start-date: "${proj.from}", end-date: "${proj.to}"),
)
${proj.descriptions.map((d) => `- ${d.text}`).join("\n")}`,
    )
    .join("\n\n");

  next = next.replace("%PROJECTS_SECTION%", projectsString);

  next = next.replace("%LANGUAGES%", abilities.languages.join(", "));
  next = next.replace("%TECHNOLOGIES%", abilities.technologies.join(", "));

  return next;
}

function Doc(input: ResumeContent) {
  const ref = useRef<HTMLDivElement>(null);

  const render = (content: string) => {
    if (!ref.current) return;
    $typst
      .svg({
        mainContent: content,
      })
      .then((svg) => {
        if (!ref.current) return;
        const container = ref.current;
        container.innerHTML = svg;
        const svgElem = container.firstElementChild;
        if (svgElem) {
          const width = Number.parseFloat(svgElem.getAttribute("width") || "0");
          const height = Number.parseFloat(
            svgElem.getAttribute("height") || "0",
          );
          const cw = container.clientWidth;
          if (width && height && cw) {
            svgElem.setAttribute("width", cw.toString());
            svgElem.setAttribute("height", ((height * cw) / width).toString());
          }
        }
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const typstContent = createTypstContent(input);
      render(typstContent);
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <>
      <div ref={ref}></div>
    </>
  );
}

interface FormType {
  contactFields: {
    value: string;
  }[];

  education: {
    uni: string;
    field: string;
    location: string;
    from: string;
    to: string;
  }[];

  experience: {
    role: string;
    company: string;
    location: string;
    from: string;
    to: string;
    context: string;
    descriptions: {
      text: string;
    }[];
  }[];

  projects: {
    projectName: string;
    organization: string;
    from: string;
    to: string;
    context: string;
    descriptions: {
      text: string;
    }[];
  }[];

  abilities: {
    languages: string[];
    technologies: string[];
  };
}

function RouteComponent() {
  const initialValuesRaw = localStorage.getItem("resume-form");
  const initialValues = initialValuesRaw ? JSON.parse(initialValuesRaw) : {};

  const { api } = useApi();

  const doLine = async (content: string, history: string[] = []) => {
    return api.resume
      .generateJobLine({
        part: "experience",
        content,
        history,
      })
      .submit();
  };

  const form = useForm({
    defaultValues: {
      contactFields: [
        {
          value: "",
        },
        {
          value: "",
        },
        {
          value: "",
        },
        {
          value: "",
        },
        {
          value: "",
        },
      ],
      education: [
        {
          uni: "",
          field: "",
          location: "",
          from: "",
          to: "",
        },
      ],
      experience: [
        {
          role: "",
          company: "",
          location: "",
          from: "",
          to: "",
          context: "",
          descriptions: [{ text: "" }],
        },
      ],
      projects: [
        {
          projectName: "",
          organization: "",
          from: "",
          to: "",
          context: "",
          descriptions: [{ text: "" }],
        },
      ],
      abilities: {
        languages: [] as string[],
        technologies: [] as string[],
      },
      ...initialValues,
    } as FormType,
    onSubmit: async ({ value }) => {
      const resumeContent: ResumeContent = {
        fullName: value.contactFields[0]?.value || "",
        email: value.contactFields[1]?.value || "",
        phone: value.contactFields[2]?.value || "",
        linkedin: value.contactFields[3]?.value || "",
        github: value.contactFields[4]?.value || "",
        education: value.education,
        experience: value.experience,
        projects: value.projects,
        abilities: value.abilities,
      };
      const typstContent = createTypstContent(resumeContent);

      const pdfData = await $typst.pdf({
        mainContent: typstContent,
      });

      const blob = new Blob([pdfData!], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    listeners: {
      onChange: ({ formApi }) => {
        localStorage.setItem(
          "resume-form",
          JSON.stringify(formApi.state.values),
        );
      },
      onChangeDebounceMs: 300,
    },
  });

  const [languageInput, setLanguageInput] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");

  return (
    <div className="flex h-screen flex-col p-4">
      <main className="grid flex-grow grid-cols-3 gap-10 overflow-hidden">
        <div className="col-span-1 overflow-y-auto rounded-lg p-6">
          <h2 className="mb-4 text-2xl font-semibold">Create your resume</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="text-lg font-semibold">Your contact details</h3>
                <p className="text-sm text-gray-500">
                  This information will appear at the top of your resume.
                </p>
              </div>

              <form.Field name="contactFields" mode="array">
                {(field) => (
                  <>
                    {field.state.value.map((_, index) => (
                      <form.Field
                        key={index}
                        name={`contactFields[${index}].value`}
                      >
                        {(subfield) => (
                          <div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor={subfield.name}>
                                {[
                                  "Name",
                                  "Email",
                                  "Phone",
                                  "LinkedIn",
                                  "Github",
                                ][index] || "Other Field"}
                              </Label>
                              <Input
                                id={subfield.name}
                                type={
                                  ["text", "email", "phone", "url", "url"][
                                    index
                                  ] || "text"
                                }
                                placeholder=""
                                value={subfield.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => {
                                  subfield.handleChange(e.target.value);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </form.Field>
                    ))}
                  </>
                )}
              </form.Field>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <form.Field name="education" mode="array">
                {(field) => (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Education</h3>
                        <p className="text-sm text-gray-500">
                          You can add multiple education entries.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          field.pushValue({
                            uni: "",
                            field: "",
                            location: "",
                            from: "",
                            to: "",
                          })
                        }
                        variant="outline"
                      >
                        + Add Education
                      </Button>
                    </div>

                    {field.state.value.map((_, index) => (
                      <div
                        key={index}
                        className="relative rounded-md border p-4"
                      >
                        {field.state.value.length > 1 ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => field.removeValue(index)}
                            className="absolute right-2 top-2 h-6 w-6"
                          >
                            X
                          </Button>
                        ) : null}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <form.Field name={`education[${index}].uni`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>
                                    University
                                  </Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. University of California"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <form.Field name={`education[${index}].field`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>
                                    Field of Study
                                  </Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. Computer Science"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>
                          <form.Field name={`education[${index}].location`}>
                            {(subfield) => (
                              <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor={subfield.name}>Location</Label>
                                <Input
                                  id={subfield.name}
                                  value={subfield.state.value}
                                  onBlur={subfield.handleBlur}
                                  onChange={(e) =>
                                    subfield.handleChange(e.target.value)
                                  }
                                  placeholder="e.g. Berkeley, CA"
                                />
                              </div>
                            )}
                          </form.Field>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <form.Field name={`education[${index}].from`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>From</Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. Aug 2020"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <form.Field name={`education[${index}].to`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>To</Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. May 2024 or Present"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </form.Field>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
              <form.Field name="experience" mode="array">
                {(field) => (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Job Experience
                        </h3>
                        <p className="text-sm text-gray-500">
                          Detail your professional roles and achievements.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          field.pushValue({
                            role: "",
                            company: "",
                            location: "",
                            from: "",
                            to: "",
                            context: "",
                            descriptions: [{ text: "" }],
                          })
                        }
                        variant="outline"
                      >
                        + Add Experience
                      </Button>
                    </div>

                    {field.state.value.map((_, index) => (
                      <div
                        key={index}
                        className="relative rounded-md border p-4"
                      >
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => field.removeValue(index)}
                          className="absolute right-2 top-2 h-6 w-6"
                        >
                          X
                        </Button>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <form.Field name={`experience[${index}].role`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>Role</Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. Software Engineer"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <form.Field name={`experience[${index}].company`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>Company</Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. Google"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <form.Field name={`experience[${index}].location`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>
                                    Location
                                  </Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. Mountain View, CA"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <div className="flex gap-2">
                              <form.Field name={`experience[${index}].from`}>
                                {(subfield) => (
                                  <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor={subfield.name}>From</Label>
                                    <Input
                                      id={subfield.name}
                                      value={subfield.state.value}
                                      onBlur={subfield.handleBlur}
                                      onChange={(e) =>
                                        subfield.handleChange(e.target.value)
                                      }
                                      placeholder="e.g. Jan 2022"
                                    />
                                  </div>
                                )}
                              </form.Field>
                              <form.Field name={`experience[${index}].to`}>
                                {(subfield) => (
                                  <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor={subfield.name}>To</Label>
                                    <Input
                                      id={subfield.name}
                                      value={subfield.state.value}
                                      onBlur={subfield.handleBlur}
                                      onChange={(e) =>
                                        subfield.handleChange(e.target.value)
                                      }
                                      placeholder="e.g. Present"
                                    />
                                  </div>
                                )}
                              </form.Field>
                            </div>
                          </div>
                          <form.Field name={`experience[${index}].context`}>
                            {(subfield) => (
                              <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor={subfield.name}>
                                  Context about the role
                                </Label>
                                <Textarea
                                  id={subfield.name}
                                  value={subfield.state.value}
                                  onBlur={subfield.handleBlur}
                                  onChange={(e) =>
                                    subfield.handleChange(e.target.value)
                                  }
                                  placeholder="Describe the company, team, and your main responsibilities in your own words. This will be used to generate achievement lines."
                                />
                              </div>
                            )}
                          </form.Field>
                          <form.Field
                            name={`experience[${index}].descriptions`}
                            mode="array"
                          >
                            {(descriptionsField) => (
                              <div className="space-y-2">
                                <Label>Achievements / Responsibilities</Label>
                                {descriptionsField.state.value.map(
                                  (_, descIndex) => (
                                    <form.Field
                                      key={descIndex}
                                      name={`experience[${index}].descriptions[${descIndex}].text`}
                                    >
                                      {(descSubfield) => (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            id={descSubfield.name}
                                            value={descSubfield.state.value}
                                            onBlur={descSubfield.handleBlur}
                                            onChange={(e) =>
                                              descSubfield.handleChange(
                                                e.target.value,
                                              )
                                            }
                                            placeholder="e.g. Developed a new feature that increased user engagement by 10%"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              descriptionsField.removeValue(
                                                descIndex,
                                              )
                                            }
                                          >
                                            X
                                          </Button>
                                        </div>
                                      )}
                                    </form.Field>
                                  ),
                                )}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      descriptionsField.pushValue({ text: "" })
                                    }
                                  >
                                    + Add empty line
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const context =
                                        form.state.values.experience[index]
                                          .context;

                                      if (!context) {
                                        toast.error("invalid context.");
                                        return;
                                      }

                                      const history =
                                        form.state.values.experience[
                                          index
                                        ].descriptions.map((it) => it.text);

                                      toast.promise(doLine(context, history), {
                                        success: (r) => {
                                          descriptionsField.pushValue({
                                            text: r.content,
                                          });

                                          return "Ready!";
                                        },
                                        error: (e) => `ups! ${String(e)}`,
                                        loading: "Loading...",
                                      });
                                    }}
                                  >
                                    Generate new line-
                                  </Button>
                                </div>
                              </div>
                            )}
                          </form.Field>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </form.Field>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
              <form.Field name="projects" mode="array">
                {(field) => (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Projects</h3>
                        <p className="text-sm text-gray-500">
                          Showcase your personal or academic projects.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          field.pushValue({
                            projectName: "",
                            organization: "",
                            from: "",
                            to: "",
                            context: "",
                            descriptions: [{ text: "" }],
                          })
                        }
                        variant="outline"
                      >
                        + Add Project
                      </Button>
                    </div>

                    {field.state.value.map((_, index) => (
                      <div
                        key={index}
                        className="relative rounded-md border p-4"
                      >
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => field.removeValue(index)}
                          className="absolute right-2 top-2 h-6 w-6"
                        >
                          X
                        </Button>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <form.Field name={`projects[${index}].projectName`}>
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>
                                    Project Name
                                  </Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. Personal Portfolio Website"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <form.Field
                              name={`projects[${index}].organization`}
                            >
                              {(subfield) => (
                                <div className="grid w-full items-center gap-1.5">
                                  <Label htmlFor={subfield.name}>
                                    Organization / Affiliation
                                  </Label>
                                  <Input
                                    id={subfield.name}
                                    value={subfield.state.value}
                                    onBlur={subfield.handleBlur}
                                    onChange={(e) =>
                                      subfield.handleChange(e.target.value)
                                    }
                                    placeholder="e.g. University Project"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex gap-2">
                              <form.Field name={`projects[${index}].from`}>
                                {(subfield) => (
                                  <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor={subfield.name}>From</Label>
                                    <Input
                                      id={subfield.name}
                                      value={subfield.state.value}
                                      onBlur={subfield.handleBlur}
                                      onChange={(e) =>
                                        subfield.handleChange(e.target.value)
                                      }
                                      placeholder="e.g. Jan 2023"
                                    />
                                  </div>
                                )}
                              </form.Field>
                              <form.Field name={`projects[${index}].to`}>
                                {(subfield) => (
                                  <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor={subfield.name}>To</Label>
                                    <Input
                                      id={subfield.name}
                                      value={subfield.state.value}
                                      onBlur={subfield.handleBlur}
                                      onChange={(e) =>
                                        subfield.handleChange(e.target.value)
                                      }
                                      placeholder="e.g. Mar 2023"
                                    />
                                  </div>
                                )}
                              </form.Field>
                            </div>
                          </div>
                          <form.Field name={`projects[${index}].context`}>
                            {(subfield) => (
                              <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor={subfield.name}>
                                  Context about the project
                                </Label>
                                <Textarea
                                  id={subfield.name}
                                  value={subfield.state.value}
                                  onBlur={subfield.handleBlur}
                                  onChange={(e) =>
                                    subfield.handleChange(e.target.value)
                                  }
                                  placeholder="Describe the project's goal, the technology stack, and your role in it. This will be used to generate achievement lines."
                                />
                              </div>
                            )}
                          </form.Field>
                          <form.Field
                            name={`projects[${index}].descriptions`}
                            mode="array"
                          >
                            {(descriptionsField) => (
                              <div className="space-y-2">
                                <Label>Key Features / Achievements</Label>
                                {descriptionsField.state.value.map(
                                  (_, descIndex) => (
                                    <form.Field
                                      key={descIndex}
                                      name={`projects[${index}].descriptions[${descIndex}].text`}
                                    >
                                      {(descSubfield) => (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            id={descSubfield.name}
                                            value={descSubfield.state.value}
                                            onBlur={descSubfield.handleBlur}
                                            onChange={(e) =>
                                              descSubfield.handleChange(
                                                e.target.value,
                                              )
                                            }
                                            placeholder="e.g. Implemented a responsive design with React and Tailwind CSS"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              descriptionsField.removeValue(
                                                descIndex,
                                              )
                                            }
                                          >
                                            X
                                          </Button>
                                        </div>
                                      )}
                                    </form.Field>
                                  ),
                                )}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      descriptionsField.pushValue({ text: "" })
                                    }
                                  >
                                    + Add empty line
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      descriptionsField.pushValue({
                                        text: "Generated: [Describe a project achievement based on the context above]",
                                      })
                                    }
                                  >
                                    Generate new line
                                  </Button>
                                </div>
                              </div>
                            )}
                          </form.Field>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </form.Field>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-semibold">Abilities</h3>

              <form.Field name="abilities.languages" mode="array">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Programming Languages</Label>
                    <div className="flex min-h-[40px] w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2">
                      {field.state.value.map((lang, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground"
                        >
                          {lang}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => field.removeValue(index)}
                            className="h-5 w-5 shrink-0"
                          >
                            <span className="sr-only">Remove {lang}</span>
                            <span aria-hidden="true">X</span>
                          </Button>
                        </div>
                      ))}
                      <Input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === ",") &&
                            languageInput.trim() !== ""
                          ) {
                            e.preventDefault();
                            if (
                              !field.state.value.includes(languageInput.trim())
                            ) {
                              field.pushValue(languageInput.trim());
                            }
                            setLanguageInput("");
                          }
                        }}
                        placeholder="Add skill and press Enter or ,"
                        className="h-auto flex-grow border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="abilities.technologies" mode="array">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Technologies</Label>
                    <div className="flex min-h-[40px] w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2">
                      {field.state.value.map((tech, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground"
                        >
                          {tech}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => field.removeValue(index)}
                            className="h-5 w-5 shrink-0"
                          >
                            <span className="sr-only">Remove {tech}</span>
                            <span aria-hidden="true">X</span>
                          </Button>
                        </div>
                      ))}
                      <Input
                        value={technologyInput}
                        onChange={(e) => setTechnologyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === ",") &&
                            technologyInput.trim() !== ""
                          ) {
                            e.preventDefault();
                            if (
                              !field.state.value.includes(
                                technologyInput.trim(),
                              )
                            ) {
                              field.pushValue(technologyInput.trim());
                            }
                            setTechnologyInput("");
                          }
                        }}
                        placeholder="Add skill and press Enter or ,"
                        className="h-auto flex-grow border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                )}
              </form.Field>
            </div>
            <Button className="w-full" type="submit">
              Generate
            </Button>
          </form>
        </div>
        <div className="col-span-2 overflow-y-auto">
          <form.Subscribe selector={(prev) => prev.values}>
            {(data) => (
              <Doc
                fullName={data.contactFields[0]?.value || ""}
                email={data.contactFields[1]?.value || ""}
                phone={data.contactFields[2]?.value || ""}
                linkedin={data.contactFields[3]?.value || ""}
                github={data.contactFields[4]?.value || ""}
                education={data.education}
                experience={data.experience}
                projects={data.projects}
                abilities={data.abilities}
              />
            )}
          </form.Subscribe>
        </div>
      </main>
    </div>
  );
}
