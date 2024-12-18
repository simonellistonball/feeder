// show a series of social login buttons for google, github and slack based login
// and a form for email and password login

import { Button } from "~/components/ui/button";

export default function Login() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Button variant="outline" className="w-full">
          <Github className="mr-2 h-4 w-4" />
          Continue with Github
        </Button>
        <Button variant="outline" className="w-full">
          <Google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full">
          <Slack className="mr-2 h-4 w-4" />
          Continue with Slack
        </Button>
      </div>
    </div>
  );
}
