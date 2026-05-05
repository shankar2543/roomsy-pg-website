import Head from "next/head";
import Navbar from "@/components/common/Navbar";
import Main from "@/components/common/Main";
import SearchByCategory from "@/components/common/SearchByCategory";
import WhyRoomsy from "@/components/common/WhyRoomsy";
import HowItWorks from "@/components/common/HowItWorks";
import PopularCities from "@/components/common/PopularCities";
import HostCTA from "@/components/common/HostCTA";
import Footer from "@/components/common/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Roomsy — Find Verified PGs Across India</title>
      </Head>
      <div style={{ backgroundColor: "#F9F7F4" }}>
      <Navbar />
      <Main />
      <SearchByCategory />
      <WhyRoomsy />
      <HowItWorks />
      <PopularCities />
      <HostCTA />
      <Footer />
    </div>
    </>
  );
}
