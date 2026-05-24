import type { Metadata } from "next";
import WrongClient from "./WrongClient";

export const metadata: Metadata = {
  title: "間違い直し — 宅建",
  description: "過去に誤答した問題のみで演習",
};

export default function WrongPage() {
  return <WrongClient />;
}
