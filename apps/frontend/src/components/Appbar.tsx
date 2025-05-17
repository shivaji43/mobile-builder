import React from "react";
import { Button } from "./ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
interface AppbarProps {
  onLogin?: () => void;
}

const Appbar: React.FC<AppbarProps> = ({}) => {
  return (
    <header className="flex justify-between items-center w-full p-4 bg-white shadow-sm rounded-lg">
      <div className="font-bold text-xl">ZeroBuilder</div>
    <div className="flex items-center space-x-4">
      <SignedOut>
        <SignInButton>
        <Button variant="outline" className="mr-2">Sign In</Button>
        </SignInButton>
        <SignUpButton>
        <Button variant="default">Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
    </header>
  );
};

export default Appbar;
