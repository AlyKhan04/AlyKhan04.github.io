import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import About from "../components/About";

export default function Home() {
const location = useLocation();


useEffect(() => {
if (location?.state?.scrollTo === "about") {
// Defer until after paint so the element exists
const id = setTimeout(() => {
const el = document.getElementById("about");
if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}, 50);
return () => clearTimeout(id);
}
}, [location]);


return (
<main>
<Hero />
<About />
</main>
);
}