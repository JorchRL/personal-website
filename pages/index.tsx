import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import footerPic from "../public/bg.png";

const Home: NextPage = () => {
  return (
    <div >
      <h1 className="px-6 font-bold text-3xl">
        Jorge builds stuff with code
      </h1>

      <div className="bg-blue-500 flex justify-center my-10">
     
      </div>

      <div className="px-6">

        <h2 className="pb-5 text-3xl">And <b>software</b> for your business</h2>

        <h3 className="pb-5 text-xl"><b>Jorge Romero.</b> Freelance software developer</h3>

       

        <hr />

      </div>

    </div>
  );
};

export default Home;
