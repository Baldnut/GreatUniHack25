"use client"
import dynamic from "next/dynamic";
import NavBar from "../ui/navbar";

const DisplayGraph = dynamic(() => import("@/app/ui/graph"), {
  ssr: false
});

export default function Home() {
  return (
    <><NavBar /><DisplayGraph /></>
  );
}
