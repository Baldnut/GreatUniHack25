"use client"
import dynamic from "next/dynamic";

const DisplayGraph = dynamic(() => import("@/app/graph/page"), {
  ssr: false
});

export default function Home() {
  return (
    <DisplayGraph />
  );
}
