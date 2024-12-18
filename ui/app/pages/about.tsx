import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About the feedback manager" },
    {
      name: "description",
      content:
        "Feedback manager provides a fast and effective way to collect feedback and intelligence from various sources",
    },
  ];
}

export default function Page() {
  return (
    <div>
      <h1>About</h1>
      <p>
        Feedback manager provides a fast and effective way to collect feedback
        and intelligence from various sources
      </p>
    </div>
  );
}
